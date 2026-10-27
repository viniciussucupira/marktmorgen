"""Execute contract cash admission against disposable loopback CI Redis only."""
import concurrent.futures
import os
import json
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis


def main():
    if os.environ.get('MARKTMORGEN_REDIS_INTEGRATION') != '1':
        raise RuntimeError('Use dedicated CI Redis on loopback port 16379 only')
    source = (Path(__file__).resolve().parents[1] / 'lib/contract-funding.ts').read_text(encoding='utf-8')
    match = re.search(r'export const RESERVE_CONTRACT = `([^`]+)`;', source)
    if not match or '$' + '{' in match.group(1):
        raise RuntimeError('Expected static application contract reservation Lua')
    script = match.group(1)
    activated = re.search(r'export const ACTIVATE_CONTRACT = `([^`]+)`;', source)
    if not activated or '$' + '{' in activated.group(1):
        raise RuntimeError('Expected static checkout activation Lua')
    activation_script = activated.group(1)
    switch_match = re.search(r'export const ACTIVATE_SWITCH_CONTRACT = `([^`]+)`;', source)
    if not switch_match or '$' + '{' in switch_match.group(1):
        raise RuntimeError('Expected static switch activation Lua')
    switch_script = switch_match.group(1)
    intent_match = re.search(r'export const CLAIM_RESTART_INTENT = `([^`]+)`;', source)
    if not intent_match or '$' + '{' in intent_match.group(1):
        raise RuntimeError('Expected static integrated restart intent Lua')
    intent_script = intent_match.group(1)
    arm_match = re.search(r'export const ARM_RESTART_SUBMISSION = `([^`]+)`;', source)
    if not arm_match or '$' + '{' in arm_match.group(1):
        raise RuntimeError('Expected static submission barrier Lua')
    arm_script = arm_match.group(1)
    result_match = re.search(r'export const RECORD_RESTART_RESULT = `([^`]+)`;', source)
    if not result_match or '$' + '{' in result_match.group(1):
        raise RuntimeError('Expected static durable restart result Lua')
    result_script = result_match.group(1)
    recovery_match = re.search(r'export const TAKE_RESTART_RECOVERY = `([^`]+)`;', source)
    if not recovery_match or '$' + '{' in recovery_match.group(1):
        raise RuntimeError('Expected static bounded restart recovery Lua')
    recovery_script = recovery_match.group(1)
    resource_source = (Path(__file__).resolve().parents[1] / 'lib/contract-resource-window.ts').read_text(encoding='utf-8')
    resource_match = re.search(r'export const RESERVE_PAID_RESOURCE_WINDOW = `([^`]+)`;', resource_source)
    if not resource_match or '$' + '{' in resource_match.group(1):
        raise RuntimeError('Expected static paid resource cohort Lua')
    resource_script = resource_match.group(1)
    prefix = 'marktmorgen:integration:contract:' + uuid.uuid4().hex + ':'
    keys = [prefix + str(i) for i in range(45)]
    intent_refs = ['synthetic-restart-intent-' + uuid.uuid4().hex + '-' + str(i) for i in range(3)]
    redis = Redis()
    def snapshot(key):
        fields = redis.command('HGETALL', key)
        assert len(fields) % 2 == 0
        # Hash iteration order is unspecified; compare every field/value pair.
        return sorted(zip(fields[::2], fields[1::2]))
    def seed(key, carried=0):
        redis.command('HSET', key, 'review', 'review', 'policy', 'binding', 'reserved', carried, 'carried', carried, 'slots:creator_month', 2, 'slots:creator_year', 2)
    def take(client, key, store='one', nonce='ctr_one', choice='creator_month', charge=50, limit=100, carry=0, binding='binding', action='checkout', source_subscription='', now=1800000001, submission=300):
        receipt = '|'.join(map(str, ['review', store, choice, action, charge, 1800000300, 1800003600, 1800086400, 2000000000000]))
        return client.command('EVAL', script, 1, key, binding, 'review', store, choice, charge, limit, carry, 2, nonce, receipt, action, source_subscription, now, *([submission] if action == 'restart' else []))
    def parallel(key, store, nonce):
        client = Redis()
        try:
            return take(client, key, store, nonce)
        finally:
            client.close()
    try:
        assert redis.command('PING') == 'PONG'
        seed(keys[0])
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(lambda i: parallel(keys[0], 'store' + str(i), 'ctr_' + str(i)), range(64)))
        assert sum(results) == 2
        assert redis.command('HGET', keys[0], 'reserved') == '100'
        assert redis.command('HGET', keys[0], 'slots:creator_month') == '0'
        print('PASS: 64 concurrent contracts cannot reuse two funded grant slots')
        seed(keys[1])
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(lambda i: parallel(keys[1], 'same', 'ctr_' + str(i)), range(64)))
        assert sum(results) == 1
        assert redis.command('HGET', keys[1], 'reserved') == '50'
        assert redis.command('HGET', keys[1], 'slots:creator_month') == '1'
        print('PASS: a store can hold only one pending contract across concurrent attempts')
        seed(keys[2])
        take(redis, keys[2])  # Deliberately ignore a committed reply.
        assert take(redis, keys[2]) == 0
        assert take(redis, keys[2], nonce='ctr_retry') == 0
        assert take(redis, keys[2], store='other') == 0
        assert redis.command('HGET', keys[2], 'reserved') == '50'
        assert redis.command('HGET', keys[2], 'grant:ctr_one') is not None
        print('PASS: lost replies retain cash, nonce, capacity and the pending store lock')
        seed(keys[3], carried=100)
        assert take(redis, keys[3], limit=200, carry=100) == 1
        assert redis.command('HGET', keys[3], 'reserved') == '150'
        redis.command('HSET', keys[3], 'reserved', 99)
        before = snapshot(keys[3])
        assert take(redis, keys[3], 'other', 'ctr_other', limit=200, carry=100) == 0
        assert snapshot(keys[3]) == before
        print('PASS: carried obligations cannot be reset to finance another contract')
        seed(keys[4])
        assert take(redis, keys[4], limit=75) == 1
        before = snapshot(keys[4])
        assert take(redis, keys[4], 'other', 'ctr_other', limit=75) == 0
        assert snapshot(keys[4]) == before
        print('PASS: the company cash ceiling blocks a grant without changing any field')
        for key, field, value in [(keys[5], 'reserved', '-1'), (keys[6], 'slots:creator_month', '3'), (keys[7], 'policy', 'changed')]:
            seed(key)
            redis.command('HSET', key, field, value)
            before = snapshot(key)
            assert take(redis, key) == 0
            assert snapshot(key) == before
        print('PASS: corrupt amounts, slots and funding bindings refuse before writes')
        seed(keys[8])
        redis.command('EXPIRE', keys[8], 60)
        assert take(redis, keys[8]) == 0
        redis.command('SET', keys[9], 'preserve')
        assert take(redis, keys[9]) == 0
        assert redis.command('GET', keys[9]) == 'preserve'
        assert take(redis, keys[10]) == 0
        assert redis.command('EXISTS', keys[10]) == 0
        print('PASS: expiring, wrong-type and missing company ledgers never initialize funding')
        seed(keys[11])
        for charge in [0, -1, '50.5', '01', 1000000000001]:
            before = snapshot(keys[11])
            assert take(redis, keys[11], charge=charge) == 0
            assert snapshot(keys[11]) == before
        print('PASS: zero, fractional, noncanonical and unsafe charges cannot create a grant')
        # Activation runs the actual application Lua, not the TypeScript double.
        instant = 1800000000
        def funded_activation(key, action='checkout'):
            seed(key)
            assert take(redis, key) == 1
            receipt = '|'.join(map(str, ['review', 'one', 'creator_month', action, 50, instant+300, instant+3600, instant+86400, 2000000000000]))
            redis.command('HSET', key, 'grant:ctr_one', receipt)
        def activate(client, key, subscription='sub_Activation001', store='one', nonce='ctr_one', created=instant, now=instant+1, phase='paid', period_start=instant, period_end=instant+30*86400):
            return client.command('EVAL', activation_script, 1, key, 'binding', 'review', store, 'creator_month', nonce, subscription, created, now, 50, 100, 0, 300, 2, phase, period_start, period_end)
        def command_calls():
            raw = redis.command('INFO', 'commandstats')
            if not isinstance(raw, str):
                raise AssertionError('Expected INFO commandstats text')
            counts = {}
            for line in raw.splitlines():
                match = re.fullmatch(r'cmdstat_([^:]+):calls=(\d+),.*', line)
                if match:
                    counts[match.group(1)] = int(match.group(2))
            if 'eval' not in counts or 'hget' not in counts:
                raise AssertionError('Command counters must include Lua and its internal calls')
            return counts
        def measured_activation(key, label, **args):
            before = command_calls()
            result = activate(redis, key, **args)
            after = command_calls()
            changes = {name: after.get(name, 0) - before.get(name, 0)
                       for name in set(before) | set(after) if name != 'info'}
            assert all(value >= 0 for value in changes.values()), changes
            changes = {name: value for name, value in changes.items() if value}
            assert changes.get('eval') == 1, changes
            total = sum(changes.values())
            assert 1 <= total <= 14, (label, total, changes)
            print('MEASURED activation commands:', label, total, sorted(changes.items()))
            return result, total
        funded_activation(keys[12])
        money = redis.command('HGET', keys[12], 'reserved')
        slots = redis.command('HGET', keys[12], 'slots:creator_month')
        result, total = measured_activation(keys[12], 'first activation')
        assert result == [1, instant+86400]
        assert total == 14, 'Every internal command must be measured, including writes'
        assert redis.command('HGET', keys[12], 'reserved') == money
        assert redis.command('HGET', keys[12], 'slots:creator_month') == slots
        assert redis.command('HGET', keys[12], 'pending:one') is None
        assert redis.command('HGET', keys[12], 'grant:ctr_one') is not None
        before = snapshot(keys[12])
        result, _ = measured_activation(keys[12], 'identical retry')
        assert result == [2, instant+30*86400]
        assert snapshot(keys[12]) == before
        result, _ = measured_activation(keys[12], 'foreign subscription', subscription='sub_Other001')
        assert result == 0
        assert activate(redis, keys[12], period_start=instant+3600, period_end=instant+30*86400+3600) == 0
        assert activate(redis, keys[12], phase='trial', period_end=instant+7*86400) == 0
        assert snapshot(keys[12]) == before
        print('PASS: checkout activation binds once, retains all cash/slots and recovers identical lost replies')
        before = snapshot(keys[12])
        assert take(redis, keys[12], nonce='ctr_second_checkout') == 0
        assert snapshot(keys[12]) == before
        active = redis.command('HGET', keys[12], 'active:one')
        before_switch = command_calls()
        assert take(redis, keys[12], nonce='ctr_switch_after_active', action='switch', source_subscription='sub_Activation001') == 1
        after_switch = command_calls()
        switch_changes = {name: after_switch.get(name, 0) - before_switch.get(name, 0)
                          for name in set(before_switch) | set(after_switch) if name != 'info'}
        assert all(value >= 0 for value in switch_changes.values()), switch_changes
        switch_changes = {name: value for name, value in switch_changes.items() if value}
        assert switch_changes.get('eval') == 1 and sum(switch_changes.values()) == 17, switch_changes
        print('MEASURED source-bound switch reservation commands:', 17, sorted(switch_changes.items()))
        assert redis.command('HGET', keys[12], 'grant:ctr_switch_after_active').split('|')[-1] == 'ctr_one'
        assert redis.command('HGET', keys[12], 'active:one') == active
        assert redis.command('HGET', keys[12], 'reserved') == '100'
        assert redis.command('HGET', keys[12], 'slots:creator_month') == '0'
        print('PASS: an active contract blocks another checkout, while a separate switch retains both obligations')
        funded_activation(keys[13])
        def parallel_activation(_):
            client = Redis()
            try:
                return activate(client, keys[13])
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(parallel_activation, range(64)))
        assert sum(result == [1, instant+86400] for result in results) == 1
        assert all(result in ([1, instant+86400], [2, instant+30*86400]) for result in results)
        assert redis.command('HGET', keys[13], 'reserved') == '50'
        assert redis.command('HGET', keys[13], 'slots:creator_month') == '1'
        print('PASS: 64 duplicate activation observations share exactly one immutable subscription binding')
        funded_activation(keys[14])
        before = snapshot(keys[14])
        for args in [dict(store='other'), dict(nonce='ctr_missing'), dict(created=instant-1), dict(now=instant+86401)]:
            assert activate(redis, keys[14], **args) == 0
            assert snapshot(keys[14]) == before
        funded_activation(keys[15], action='switch')
        assert activate(redis, keys[15]) == 0
        print('PASS: foreign, absent, expired, predating and switch receipts cannot activate checkout rights')
        for key, field, value in [(keys[16], 'reserved', 0), (keys[17], 'slots:creator_month', 2), (keys[18], 'active:one', 'other')]:
            funded_activation(key)
            redis.command('HSET', key, field, value)
            before = snapshot(key)
            assert activate(redis, key) == 0
            assert snapshot(key) == before
        funded_activation(keys[19])
        redis.command('EXPIRE', keys[19], 60)
        before = snapshot(keys[19])
        assert activate(redis, keys[19]) == 0
        assert snapshot(keys[19]) == before
        print('PASS: corrupt, already-active and expiring activation ledgers fail before writes')
        seed(keys[20])
        before = snapshot(keys[20])
        forged_receipt = 'review|one|creator_month|checkout|50|1800000300|1800003600|1800086400|2000000000000'
        assert redis.command('EVAL', script, 1, keys[20], 'binding', 'review', 'one', 'creator_month', 50, 100, 0, 2, 'ctr_wrong_action', forged_receipt, 'switch') == 0
        assert snapshot(keys[20]) == before
        before_calls = command_calls()
        assert take(redis, keys[20]) == 1
        after_calls = command_calls()
        changes = {name: after_calls.get(name, 0) - before_calls.get(name, 0)
                   for name in set(before_calls) | set(after_calls) if name != 'info'}
        assert all(value >= 0 for value in changes.values()), changes
        changes = {name: value for name, value in changes.items() if value}
        assert changes.get('eval') == 1 and sum(changes.values()) == 15, changes
        print('MEASURED checkout reservation commands:', 15, sorted(changes.items()))


        seed(keys[21])
        before = snapshot(keys[21])
        assert take(redis, keys[21], action='switch', source_subscription='sub_Activation001') == 0
        assert snapshot(keys[21]) == before
        for key, corrupt in [
            (keys[22], 'foreign'),
            (keys[23], 'expired'),
            (keys[24], 'activation'),
            (keys[25], 'receipt-store'),
            (keys[26], 'receipt-tail'),
        ]:
            funded_activation(key)
            assert activate(redis, key) == [1, instant+86400]
            sub = 'sub_Activation001'
            if corrupt == 'foreign':
                sub = 'sub_Other0001'
            elif corrupt == 'expired':
                expired = '|'.join(map(str, ['ctr_one', sub, 'creator_month', instant, 'paid', instant, instant+1]))
                redis.command('HSET', key, 'active:one', expired, 'activated:ctr_one', expired)
            elif corrupt == 'activation':
                redis.command('HSET', key, 'activated:ctr_one', 'different')
            else:
                receipt = redis.command('HGET', key, 'grant:ctr_one').split('|')
                receipt[1 if corrupt == 'receipt-store' else 8] = 'other' if corrupt == 'receipt-store' else str(instant*1000)
                redis.command('HSET', key, 'grant:ctr_one', '|'.join(receipt))
            before = snapshot(key)
            assert take(redis, key, nonce='ctr_denied_switch', action='switch', source_subscription=sub, now=instant+2) == 0
            assert snapshot(key) == before
        print('PASS: missing, foreign, expired and corrupt source bindings cannot spend another cent or slot')
        funded_activation(keys[27])
        assert activate(redis, keys[27]) == [1, instant+86400]
        old_active = redis.command('HGET', keys[27], 'active:one')
        old_receipt = redis.command('HGET', keys[27], 'grant:ctr_one')
        def parallel_switch(i):
            client = Redis()
            try:
                return take(client, keys[27], nonce='ctr_switch_'+str(i), action='switch', source_subscription='sub_Activation001')
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(parallel_switch, range(64)))
        assert sum(results) == 1
        assert redis.command('HGET', keys[27], 'active:one') == old_active
        assert redis.command('HGET', keys[27], 'grant:ctr_one') == old_receipt
        assert redis.command('HGET', keys[27], 'reserved') == '100'
        pending = redis.command('HGET', keys[27], 'pending:one')
        receipt = redis.command('HGET', keys[27], 'grant:'+pending).split('|')
        assert len(receipt) == 10 and receipt[-1] == 'ctr_one'
        before = snapshot(keys[27])
        assert take(redis, keys[27], nonce='ctr_lost_reply_retry', action='switch', source_subscription='sub_Activation001') == 0
        assert snapshot(keys[27]) == before
        print('PASS: 64 source-bound switches fund one additional obligation and preserve the old active grant')


        def switch_ready(key, trial=False):
            funded_activation(key)
            if trial:
                assert activate(redis, key, phase='trial', period_end=instant+7*86400) == [1, instant+86400]
            else:
                assert activate(redis, key) == [1, instant+86400]
            assert take(redis, key, nonce='ctr_switch', action='switch', source_subscription='sub_Activation001') == 1
        def switch_activate(client, key, subscription='sub_Activation001', created=instant, now=instant+2, phase='paid', start=instant, finish=instant+30*86400, span=31*86400):
            return client.command('EVAL', switch_script, 1, key, 'binding', 'review', 'one', 'creator_month', 'ctr_switch', subscription, created, now, 50, 100, 0, 300, 2, phase, start, finish, span)
        switch_ready(keys[28])
        source_proof = redis.command('HGET', keys[28], 'active:one')
        source_receipt = redis.command('HGET', keys[28], 'grant:ctr_one')
        before_calls = command_calls()
        assert switch_activate(redis, keys[28]) == [1, instant+86400]
        after_calls = command_calls()
        switch_activation_changes = {name: after_calls.get(name, 0)-before_calls.get(name, 0)
                                     for name in set(before_calls) | set(after_calls) if name != 'info'}
        assert all(value >= 0 for value in switch_activation_changes.values())
        switch_activation_changes = {name: count for name, count in switch_activation_changes.items() if count}
        assert switch_activation_changes.get('eval') == 1 and sum(switch_activation_changes.values()) == 16, switch_activation_changes
        print('MEASURED switch activation commands:', 16, sorted(switch_activation_changes.items()))
        assert redis.command('HGET', keys[28], 'active:one') != source_proof
        assert redis.command('HGET', keys[28], 'activated:ctr_one') == source_proof
        assert redis.command('HGET', keys[28], 'grant:ctr_one') == source_receipt
        assert redis.command('HGET', keys[28], 'pending:one') is None
        assert redis.command('HGET', keys[28], 'reserved') == '100'
        assert redis.command('HGET', keys[28], 'slots:creator_month') == '0'
        before = snapshot(keys[28])
        before_calls = command_calls()
        assert switch_activate(redis, keys[28]) == [2, instant+30*86400]
        after_calls = command_calls()
        retry_changes = {name: after_calls.get(name, 0)-before_calls.get(name, 0)
                         for name in set(before_calls) | set(after_calls) if name != 'info'}
        assert all(value >= 0 for value in retry_changes.values()) and sum(retry_changes.values()) == 13, retry_changes
        print('MEASURED switch activation retry commands:', 13, sorted((name, count) for name, count in retry_changes.items() if count))
        assert snapshot(keys[28]) == before
        switch_ready(keys[29])
        def parallel_switch_activation(_):
            client = Redis()
            try:
                return switch_activate(client, keys[29])
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(parallel_switch_activation, range(64)))
        assert sum(value == [1, instant+86400] for value in results) == 1
        assert all(value in ([1, instant+86400], [2, instant+30*86400]) for value in results)
        assert redis.command('HGET', keys[29], 'reserved') == '100'
        assert redis.command('HGET', keys[29], 'slots:creator_month') == '0'
        assert redis.command('HGET', keys[29], 'activated:ctr_one') is not None
        print('PASS: 64 switch activation observations share one new binding and retain both principals')
        switch_ready(keys[30])
        before = snapshot(keys[30])
        for args in [dict(subscription='sub_Other0001'), dict(created=instant+1), dict(phase='trial', finish=instant+7*86400), dict(finish=instant+32*86400), dict(now=instant+86401)]:
            assert switch_activate(redis, keys[30], **args) == 0
            assert snapshot(keys[30]) == before
        switch_ready(keys[31], trial=True)
        before = snapshot(keys[31])
        assert switch_activate(redis, keys[31], phase='trial', finish=instant+8*86400, span=14*86400) == 0
        assert snapshot(keys[31]) == before
        assert switch_activate(redis, keys[31], phase='trial', finish=instant+7*86400, span=14*86400) == [1, instant+86400]
        for key, field, value in [(keys[32], 'active:one', 'different'), (keys[33], 'activated:ctr_one', 'different'), (keys[34], 'grant:ctr_one', 'missing'), (keys[35], 'reserved', 50)]:
            switch_ready(key)
            redis.command('HSET', key, field, value)
            before = snapshot(key)
            assert switch_activate(redis, key) == 0
            assert snapshot(key) == before
        print('PASS: foreign periods, new or extended trials, corrupt sources and insufficient cash cannot activate a switch')
        funded_activation(keys[36])
        old_created = instant-30*86400
        old_receipt = '|'.join(map(str, ['review', 'one', 'creator_month', 'checkout', 50, old_created+300, old_created+3600, old_created+86400, 2000000000000]))
        redis.command('HSET', keys[36], 'grant:ctr_one', old_receipt)
        assert activate(redis, keys[36], created=old_created, now=old_created+1, period_start=old_created, period_end=old_created+31*86400) == [1, old_created+86400]
        assert take(redis, keys[36], nonce='ctr_switch', action='switch', source_subscription='sub_Activation001') == 1
        assert switch_activate(redis, keys[36], created=old_created) == [1, instant+86400]
        print('PASS: a switch keeps the original subscription creation identity while its new grant has a fresh deadline')

        # Late observations may read only a previously committed exact term.
        # Reuse existing generated keys; no extra service or cleanup namespace.
        before = snapshot(keys[13])
        before_calls = command_calls()
        assert activate(redis, keys[13], now=instant+2*86400) == [2, instant+30*86400]
        after_calls = command_calls()
        changes = {name: after_calls.get(name, 0)-before_calls.get(name, 0)
                   for name in set(before_calls) | set(after_calls) if name != 'info'}
        assert all(value >= 0 for value in changes.values()) and sum(changes.values()) == 11, changes
        print('MEASURED committed checkout term observation commands:', 11, sorted((name, count) for name, count in changes.items() if count))
        assert snapshot(keys[13]) == before
        assert activate(redis, keys[13], now=instant+30*86400) == 0
        assert activate(redis, keys[13], now=instant+2*86400, period_end=instant+30*86400+1) == 0
        assert snapshot(keys[13]) == before
        before = snapshot(keys[29])
        before_calls = command_calls()
        assert switch_activate(redis, keys[29], now=instant+2*86400) == [2, instant+30*86400]
        after_calls = command_calls()
        changes = {name: after_calls.get(name, 0)-before_calls.get(name, 0)
                   for name in set(before_calls) | set(after_calls) if name != 'info'}
        assert all(value >= 0 for value in changes.values()) and sum(changes.values()) == 13, changes
        print('MEASURED committed switch term observation commands:', 13, sorted((name, count) for name, count in changes.items() if count))
        assert snapshot(keys[29]) == before
        assert switch_activate(redis, keys[29], now=instant+30*86400) == 0
        assert switch_activate(redis, keys[29], now=instant+2*86400, start=instant+1) == 0
        assert snapshot(keys[29]) == before
        print('PASS: committed checkout and switch proofs survive activation deadlines without any write, renewal or expired unconsumed activation')

        def resource_slots(key, annual=False):
            redis.command('HSET', key, 'slots:creator_month', 0 if annual else 1,
                          'slots:creator_year', 1 if annual else 0,
                          'slots:pro_month', 0, 'slots:pro_year', 0, 'slots:scale_month', 0, 'slots:scale_year', 0)
        def resource_claim(client, key, annual=False, index=0, subscription='sub_Activation001', shift=0, now_ms=None):
            start, finish = instant, instant+(360 if annual else 30)*86400
            from_ms = (instant+index*30*86400)*1000+shift
            until_ms = (instant+(index+1)*30*86400)*1000
            now_ms = now_ms if now_ms is not None else from_ms+1000
            quotes = [0 if annual else 2, 50, 2 if annual else 0, 50, 0, 1, 0, 1, 0, 1, 0, 1]
            return client.command('EVAL', resource_script, 1, key, 'binding', 'review', 'one',
                                  subscription, 'creator_year' if annual else 'creator_month',
                                  start, finish, from_ms, until_ms, now_ms, index, 12 if annual else 1,
                                  50, 100, 0, 2, *quotes)
        funded_activation(keys[37])
        assert activate(redis, keys[37]) == [1, instant+86400]
        resource_slots(keys[37])
        original = snapshot(keys[37])
        for expected_count, label in [(18, 'first cohort'), (17, 'repeated cohort')]:
            before_calls = command_calls()
            assert resource_claim(redis, keys[37]) == [1, (instant+30*86400)*1000]
            after_calls = command_calls()
            delta = {name: after_calls.get(name, 0)-before_calls.get(name, 0)
                     for name in set(before_calls) | set(after_calls) if name != 'info'}
            assert all(value >= 0 for value in delta.values()) and sum(delta.values()) == expected_count, delta
            print('MEASURED paid resource commands:', label, expected_count, sorted((name, value) for name, value in delta.items() if value))
        for name, value in original:
            assert redis.command('HGET', keys[37], name) == value
        committed = snapshot(keys[37])
        for args in [dict(subscription='sub_Foreign001'), dict(shift=1), dict(index=1), dict(now_ms=(instant+30*86400)*1000)]:
            assert resource_claim(redis, keys[37], **args) == 0
            assert snapshot(keys[37]) == committed
        redis.command('HSET', keys[37], 'slots:pro_year', 1)
        corrupt = snapshot(keys[37])
        assert resource_claim(redis, keys[37]) == 0
        assert snapshot(keys[37]) == corrupt
        seed(keys[38])
        redis.command('HSET', keys[38], 'slots:creator_month', 0)
        assert take(redis, keys[38], choice='creator_year') == 1
        assert redis.command('EVAL', activation_script, 1, keys[38], 'binding', 'review', 'one',
                             'creator_year', 'ctr_one', 'sub_Activation001', instant, instant+1,
                             50, 100, 0, 300, 2, 'paid', instant, instant+360*86400) == [1, instant+86400]
        resource_slots(keys[38], annual=True)
        def concurrent_resource(_):
            client = Redis()
            try:
                return resource_claim(client, keys[38], annual=True)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(concurrent_resource, range(64)))
        assert all(value == [1, (instant+30*86400)*1000] for value in results)
        assert len([name for name, value in snapshot(keys[38]) if name.startswith('resource:')]) == 1
        for index in range(12):
            assert resource_claim(redis, keys[38], annual=True, index=index) == [1, (instant+(index+1)*30*86400)*1000]
        before = snapshot(keys[38])
        assert len([name for name, value in before if name.startswith('resource:')]) == 12
        assert resource_claim(redis, keys[38], annual=True, index=12) == 0
        assert redis.command('HGET', keys[38], 'reserved') == '50'
        assert redis.command('HGET', keys[38], 'slots:creator_year') == '1'
        assert snapshot(keys[38]) == before
        redis.command('EXPIRE', keys[38], 60)
        assert resource_claim(redis, keys[38], annual=True) == 0
        assert snapshot(keys[38]) == before
        print('PASS: paid resource cohorts retain cash, reconcile six slot counters, share64 replies and bound annual fields to12')


        # Reservation-only restart primitive. The production TypeScript gate is
        # false; these receipts/cash are synthetic, not reviewed supplier funds.
        def seed_restart(key):
            redis.command('DEL', key)
            seed(key)
            binding = 'ctr_restart_source|sub_RestartSource01|creator_month|1799999000|paid|1799999000|1800000000'
            receipt = 'review|restart-store|creator_month|checkout|40|1799999300|1800000000|1800000200|2000000000000'
            redis.command('HSET', key, 'reserved', 40, 'active:restart-store', binding,
                          'activated:ctr_restart_source', binding, 'grant:ctr_restart_source', receipt)
            return binding, receipt
        def take_restart(client, key, nonce='ctr_restart_new', **over):
            args = dict(store='restart-store', nonce=nonce, action='restart',
                        source_subscription='sub_RestartSource01', limit=140)
            args.update(over)
            return take(client, key, **args)
        old_binding, old_receipt = seed_restart(keys[39])
        def concurrent_restart(index):
            client = Redis()
            try:
                return take_restart(client, keys[39], 'ctr_restart_' + str(index))
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(concurrent_restart, range(64)))
        assert sum(results) == 1
        assert redis.command('HGET', keys[39], 'reserved') == '90'
        assert redis.command('HGET', keys[39], 'slots:creator_month') == '1'
        assert redis.command('HGET', keys[39], 'active:restart-store') == old_binding
        assert redis.command('HGET', keys[39], 'activated:ctr_restart_source') == old_binding
        assert redis.command('HGET', keys[39], 'grant:ctr_restart_source') == old_receipt
        winner = redis.command('HGET', keys[39], 'pending:restart-store')
        assert winner.startswith('ctr_restart_')
        assert redis.command('HGET', keys[39], 'grant:' + winner).endswith('|ctr_restart_source')
        assert redis.command('TTL', keys[39]) == -1
        print('PASS: 64 restart reserves share one new full obligation and retain every old cash/source receipt')

        invalid = [
            ('active:restart-store', old_binding.replace('|paid|', '|trial|'), {}),
            ('active:restart-store', old_binding.replace('|1800000000', '|1800000100'), {}),
            ('active:restart-store', old_binding.replace('creator_month', 'creator_year'), {}),
            ('active:restart-store', old_binding + '|extra', {}),
            ('activated:ctr_restart_source', 'mismatched', {}),
            ('grant:ctr_restart_source', old_receipt.replace('|restart-store|', '|other-store|'), {}),
            ('grant:ctr_restart_source', old_receipt.replace('|40|', '|41|'), {'limit': 40}),
            ('grant:ctr_restart_source', old_receipt + '|extra', {}),
            ('reserved', 39, {}),
            ('policy', 'unknown', {}),
            (None, None, {'source_subscription': 'sub_OtherSource01'}),
            (None, None, {'choice': 'creator_year'}),
            (None, None, {'choice': 'pro_month'}),
            (None, None, {'now': 1800000301}),
            (None, None, {'submission': 0}),
            (None, None, {'submission': '01'}),
        ]
        for field, value, options in invalid:
            seed_restart(keys[40])
            if field is not None:
                redis.command('HSET', keys[40], field, value)
            before = snapshot(keys[40])
            assert take_restart(redis, keys[40], **options) == 0
            assert snapshot(keys[40]) == before
        seed_restart(keys[40])
        redis.command('HDEL', keys[40], 'activated:ctr_restart_source')
        before = snapshot(keys[40])
        assert take_restart(redis, keys[40]) == 0
        assert snapshot(keys[40]) == before
        print('PASS: unknown, live, trial, foreign, annual or unbacked restart sources refuse without writes')

        # Count the actual application Lua's commands, including EVAL and
        # internal calls. Exclude only INFO used to observe the test.
        rule_source = (Path(__file__).resolve().parents[1] / 'lib/contract-funding-rules.ts').read_text(encoding='utf-8')
        ceiling_match = re.search(r'restartReservation:\{[^}]*commandCeiling:(\d+)', rule_source)
        assert ceiling_match
        command_ceiling = int(ceiling_match.group(1))
        def command_counts():
            answer = redis.command('INFO', 'commandstats')
            return {name: int(count) for name, count in re.findall(r'cmdstat_([^:]+):calls=(\d+)', answer)}
        def difference(before, after):
            return {name: count-before.get(name, 0) for name, count in after.items()
                    if name != 'info' and count-before.get(name, 0) > 0}
        old_binding, old_receipt = seed_restart(keys[41])
        before_counts = command_counts()
        assert take_restart(redis, keys[41]) == 1
        first_counts = difference(before_counts, command_counts())
        assert sum(first_counts.values()) <= command_ceiling
        # Ignore that committed acknowledgement; neither same nor new nonce
        # may reserve again, expire ownership, release old cash or overwrite it.
        before = snapshot(keys[41])
        before_counts = command_counts()
        assert take_restart(redis, keys[41]) == 0
        duplicate_counts = difference(before_counts, command_counts())
        assert sum(duplicate_counts.values()) <= command_ceiling
        assert take_restart(redis, keys[41], 'ctr_retry_restart') == 0
        assert take(redis, keys[41], store='restart-store', nonce='ctr_restart_checkout') == 0
        assert snapshot(keys[41]) == before
        assert redis.command('HGET', keys[41], 'reserved') == '90'
        assert redis.command('HGET', keys[41], 'active:restart-store') == old_binding
        assert redis.command('HGET', keys[41], 'grant:ctr_restart_source') == old_receipt
        print('PASS: restart lost-ack reservation retains cash and pending ownership without replay')
        print('MEASURED restart reservation commands: first=' + str(first_counts) +
              ', duplicate=' + str(duplicate_counts) + ', canonical ceiling=' + str(command_ceiling))

        # Actual application intent ownership, separate from reservation. No
        # provider permission, activation or production coverage is inferred.
        def intent_ready(key, ref, source_action='checkout'):
            assert source_action in ('checkout', 'switch', 'restart')
            _, receipt = seed_restart(key)
            if source_action != 'checkout':
                receipt = receipt.replace('|checkout|', '|' + source_action + '|') + '|ctr_upstream_source'
                # Historical upstream principal is retained explicitly, not
                # silently treated as zero by a synthetic ten-field fixture.
                if source_action == 'switch':
                    upstream = 'ctr_upstream_source|sub_RestartSource01|creator_month|1799999000|paid|1799999000|1800000000'
                    upstream_receipt = 'review|restart-store|creator_month|checkout|10|1799999300|1800000000|1800000200|2000000000000'
                else:
                    upstream = 'ctr_upstream_source|sub_PreviousSource01|creator_month|1799998000|paid|1799998000|1799999000'
                    upstream_receipt = 'review|restart-store|creator_month|checkout|10|1799998300|1799999000|1799999300|2000000000000'
                redis.command('HSET', key, 'grant:ctr_restart_source', receipt, 'reserved', 50,
                              'grant:ctr_upstream_source', upstream_receipt,
                              'activated:ctr_upstream_source', upstream)
            assert take_restart(redis, key) == 1
            pause = json.dumps(dict(subscription='sub_RestartSource01',
                                    customer='cus_IntentCustomer01', paymentMethod='pm_IntentCard001',
                                    tier='creator', **{'from': 1800000000}, until=1800000001,
                                    told=0, funding=dict(version=1, grantId='ctr_restart_source')),
                               separators=(',', ':'))
            redis.command('SET', 'nl:pause:' + ref, pause)
            redis.command('SET', 'nl:pause:last:' + ref, 1799999000)
            redis.command('ZADD', 'nl:pause:due', 1800000001, ref)
            return pause
        def intent_claim(client, key, ref, pause, claim='claim_first', **over):
            options = dict(binding='binding', review='review', now=1800000001,
                           source='sub_RestartSource01', raw=pause, amount=50, limit=140,
                           source_grant='ctr_restart_source', payload=None, extra=False, prove_input_bound=False)
            options.update(over)
            intent = json.dumps(dict(version=1, grant='ctr_restart_new', review=options['review'],
                                     statsId='restart-store', sourceSubscription=options['source'],
                                     sourceGrant=options['source_grant'], ref=ref, handle='synthetic-store',
                                     paused=options['raw'], claim=claim, created=options['now'],
                                     deadline=1800000300), separators=(',', ':'))
            if options['extra']:
                intent = json.dumps({**json.loads(intent), 'unexpected': 'not an owned field'}, separators=(',', ':'))
            if options['prove_input_bound']:
                assert len(intent.encode()) <= 4096
            return client.command('EVAL', intent_script, 4, key, 'nl:pause:' + ref,
                                  'nl:pause:due', 'nl:pause:last:' + ref,
                                  options['binding'], options['review'], 'restart-store',
                                  'creator_month', 'ctr_restart_new', options['source'],
                                  options['now'], options['amount'], options['limit'], 0, 300,
                                  ref, options['raw'], claim, 'synthetic-store',
                                  options['payload'] if options['payload'] is not None else intent)
        pause = intent_ready(keys[42], intent_refs[0])
        before = snapshot(keys[42])
        def concurrent_intent(index):
            client = Redis()
            try:
                return intent_claim(client, keys[42], intent_refs[0], pause, 'claim_' + str(index))
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(concurrent_intent, range(64)))
        assert sum(isinstance(result, list) and len(result) == 2 and result[0] == 1 for result in results) == 1
        assert all(result == 0 or isinstance(result, list) and len(result) == 2 and result[0] == 1 and isinstance(result[1], str) for result in results)
        for field, value in before:
            assert redis.command('HGET', keys[42], field) == value
        claimed = json.loads(redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new'))
        assert claimed['paused'] == pause and claimed['sourceGrant'] == 'ctr_restart_source'
        original = dict(before)
        assert claimed['sourceBinding'] == original['active:restart-store']
        assert claimed['sourceReceipt'] == original['grant:ctr_restart_source']
        assert claimed['restartReceipt'] == original['grant:ctr_restart_new']
        assert claimed['reservedCents'] == 90 and claimed['carriedCents'] == 0
        winner = next(result for result in results if isinstance(result, list))
        assert winner[1] == redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new')
        assert redis.command('TTL', keys[42]) == -1
        print('PASS:64 actual restart intent contenders produce one immutable owned source/cash snapshot')

        # Unknown acknowledgement is deliberately ignored; all subsequent
        # attempts, including a new nonce and time beyond the window, refuse.
        pause = intent_ready(keys[44], intent_refs[2])
        match = re.search(r'restartIntent:\{[^}]*commandCeiling:(\d+)', rule_source)
        assert match
        intent_ceiling = int(match.group(1))
        before_calls = command_counts()
        first_ack = intent_claim(redis, keys[44], intent_refs[2], pause)
        first = difference(before_calls, command_counts())
        assert sum(first.values()) <= intent_ceiling
        assert isinstance(first_ack, list) and len(first_ack) == 2 and first_ack[0] == 1
        assert first_ack[1] == redis.command('HGET', keys[44], 'restart-intent:ctr_restart_new')
        committed = snapshot(keys[44])
        before_calls = command_counts()
        assert intent_claim(redis, keys[44], intent_refs[2], pause) == 0
        duplicate = difference(before_calls, command_counts())
        assert sum(duplicate.values()) <= intent_ceiling
        assert intent_claim(redis, keys[44], intent_refs[2], pause, claim='claim_after_lost_ack') == 0
        assert intent_claim(redis, keys[44], intent_refs[2], pause, now=1800000301) == 0
        assert snapshot(keys[44]) == committed
        print('MEASURED restart intent commands:first=' + str(first) + ',duplicate=' + str(duplicate) + ',canonical ceiling=' + str(intent_ceiling))
        print('PASS:lost intent ACK never releases money, expires ownership or yields a second permission')

        for scenario in ['policy', 'review', 'pending', 'source', 'activated', 'old-grant',
                         'cash', 'carried', 'ttl', 'pause-missing', 'pause-marker',
                         'due-missing', 'due-score', 'annual-missing', 'raw-mismatch',
                         'expired', 'rollback', 'foreign-source', 'foreign-grant', 'oversize',
                         'extra-request-field', 'enriched-overflow']:
            ref = intent_refs[1]
            pause = intent_ready(keys[43], ref)
            args = {}
            if scenario in ('policy', 'review'):
                redis.command('HSET', keys[43], scenario, 'unknown')
            elif scenario == 'pending':
                redis.command('HSET', keys[43], 'pending:restart-store', 'ctr_foreign')
            elif scenario == 'source':
                redis.command('HSET', keys[43], 'active:restart-store', 'unknown')
            elif scenario == 'activated':
                redis.command('HDEL', keys[43], 'activated:ctr_restart_source')
            elif scenario == 'old-grant':
                redis.command('HDEL', keys[43], 'grant:ctr_restart_source')
            elif scenario == 'cash':
                redis.command('HSET', keys[43], 'reserved', 89)
            elif scenario == 'carried':
                redis.command('HSET', keys[43], 'carried', 1)
            elif scenario == 'ttl':
                redis.command('EXPIRE', keys[43], 60)
            elif scenario == 'pause-missing':
                redis.command('DEL', 'nl:pause:' + ref)
            elif scenario == 'pause-marker':
                pause = pause.replace('"version":1', '"version":2')
                redis.command('SET', 'nl:pause:' + ref, pause)
            elif scenario == 'due-missing':
                redis.command('ZREM', 'nl:pause:due', ref)
            elif scenario == 'due-score':
                redis.command('ZADD', 'nl:pause:due', 1800000002, ref)
            elif scenario == 'annual-missing':
                redis.command('DEL', 'nl:pause:last:' + ref)
            elif scenario == 'raw-mismatch':
                args['raw'] = pause + ' '
            elif scenario == 'expired':
                args['now'] = 1800000301
            elif scenario == 'rollback':
                args['now'] = 1799999999
            elif scenario == 'foreign-source':
                args['source'] = 'sub_ForeignIntent01'
            elif scenario == 'foreign-grant':
                args['source_grant'] = 'ctr_foreign'
            elif scenario == 'oversize':
                args['payload'] = 'x' * 4097
            elif scenario == 'extra-request-field':
                args['extra'] = True
            elif scenario == 'enriched-overflow':
                review = 'R' * 850
                old = redis.command('HGET', keys[43], 'grant:ctr_restart_source').replace('review|', review + '|', 1)
                new = redis.command('HGET', keys[43], 'grant:ctr_restart_new').replace('review|', review + '|', 1)
                assert len(old.encode()) <= 1024 and len(new.encode()) <= 1024
                redis.command('HSET', keys[43], 'review', review, 'grant:ctr_restart_source', old, 'grant:ctr_restart_new', new)
                pause = json.dumps({**json.loads(pause), 'padding': 'x' * 900}, separators=(',', ':'))
                assert len(pause.encode()) <= 1536
                redis.command('SET', 'nl:pause:' + ref, pause)
                args.update(review=review, prove_input_bound=True)
            before = snapshot(keys[43])
            pause_before = redis.command('GET', 'nl:pause:' + ref)
            last_before = redis.command('GET', 'nl:pause:last:' + ref)
            due_before = redis.command('ZSCORE', 'nl:pause:due', ref)
            assert intent_claim(redis, keys[43], ref, pause, **args) == 0, scenario
            assert snapshot(keys[43]) == before, scenario
            assert redis.command('GET', 'nl:pause:' + ref) == pause_before
            assert redis.command('GET', 'nl:pause:last:' + ref) == last_before
            assert redis.command('ZSCORE', 'nl:pause:due', ref) == due_before
        print('PASS:22 unknown, mismatched or over-limit restart intent observations retain exact pause/source/annual/cash evidence')

        for source_action in ('switch', 'restart'):
            ref = intent_refs[1]
            pause = intent_ready(keys[43], ref, source_action)
            before = snapshot(keys[43])
            ack = intent_claim(redis, keys[43], ref, pause)
            assert isinstance(ack, list) and len(ack) == 2 and ack[0] == 1
            owned = json.loads(ack[1])
            prior = dict(before)
            assert owned['sourceReceipt'] == prior['grant:ctr_restart_source']
            assert owned['sourceReceipt'].split('|')[3] == source_action
            assert len(owned['sourceReceipt'].split('|')) == 10
            assert owned['sourceBinding'] == prior['active:restart-store']
            assert owned['reservedCents'] == 100 and owned['carriedCents'] == 0
            assert prior['grant:ctr_upstream_source'].split('|')[4] == '10'
            assert redis.command('HGET', keys[43], 'grant:ctr_upstream_source') == prior['grant:ctr_upstream_source']
            assert redis.command('HGET', keys[43], 'activated:ctr_upstream_source') == prior['activated:ctr_upstream_source']
            assert ack[1] == redis.command('HGET', keys[43], 'restart-intent:ctr_restart_new')
            for field, value in before:
                assert redis.command('HGET', keys[43], field) == value
        print('PASS:owned intent retains exact checkout, switch and prior-restart source receipts without replacing any principal')

        def arm(client, key, ref, pause, **over):
            args = dict(binding='binding', review='review', stats='restart-store', grant='ctr_restart_new',
                        claim='claim_first', now=1800000002, claimed=1800000001, deadline=1800000300,
                        raw=pause, source=json.loads(client.command('HGET', key, 'restart-intent:ctr_restart_new'))['sourceBinding'],
                        price='price_SyntheticRestart01', digest='a' * 64)
            args.update(over)
            return client.command(
                'EVAL', arm_script, 4, key, 'nl:pause:' + ref, 'nl:pause:due', 'nl:pause:last:' + ref,
                args['binding'], args['review'], args['stats'], args['grant'], args['claim'], args['now'],
                args['claimed'], args['deadline'], ref, args['raw'], args['source'], args['price'], args['digest'])
        ref = intent_refs[0]
        pause = intent_ready(keys[42], ref)
        assert intent_claim(redis, keys[42], ref, pause)[0] == 1
        before = snapshot(keys[42])
        original_intent = json.loads(redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new'))
        # Capture the source before measuring actual Redis commands.
        binding = original_intent['sourceBinding']
        def arm_direct(client):
            return client.command('EVAL', arm_script, 4, keys[42], 'nl:pause:' + ref,
                                  'nl:pause:due', 'nl:pause:last:' + ref,
                                  'binding','review','restart-store','ctr_restart_new','claim_first',
                                  1800000002,1800000001,1800000300,ref,pause,binding,
                                  'price_SyntheticRestart01','a' * 64)
        counts = command_counts()
        armed_ack = arm_direct(redis)
        first_arm_counts = difference(counts, command_counts())
        assert sum(first_arm_counts.values()) <= intent_ceiling
        assert armed_ack[0] == 1
        # Deliberately ignore first ACK: all contenders must refuse permanently.
        def duplicate_arm(_index):
            client = Redis()
            try:
                return arm_direct(client)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            assert list(pool.map(duplicate_arm, range(64))) == [0] * 64
        stored = json.loads(redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new'))
        assert stored.pop('submission') == dict(version=1,phase='uncertain',priceId='price_SyntheticRestart01',
                                               bodyHash='a' * 64,armedAt=1800000002,
                                               idempotencyKey='restart:ctr_restart_new:claim_first')
        assert stored == original_intent
        assert armed_ack[1] == redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new')
        for field, value in before:
            if field != 'restart-intent:ctr_restart_new':
                assert redis.command('HGET', keys[42], field) == value
        assert redis.command('TTL', keys[42]) == -1
        print('PASS:actual permanent submission barrier retains all source/cash fields and refuses64duplicates after ignoredACK')
        print('RESTART_SUBMISSION_BARRIER_COMMANDS:' + json.dumps(first_arm_counts, sort_keys=True))

        race_ref = intent_refs[2]
        race_pause = intent_ready(keys[44], race_ref)
        assert intent_claim(redis, keys[44], race_ref, race_pause)[0] == 1
        race_original = json.loads(redis.command('HGET', keys[44], 'restart-intent:ctr_restart_new'))
        def first_arm_race(_index):
            client = Redis()
            try:
                return arm(client, keys[44], race_ref, race_pause)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            raced = list(pool.map(first_arm_race, range(64)))
        assert sum(isinstance(value,list) and value[0] == 1 for value in raced) == 1
        race_stored = json.loads(redis.command('HGET', keys[44], 'restart-intent:ctr_restart_new'))
        assert race_stored.pop('submission')['phase'] == 'uncertain'
        assert race_stored == race_original
        assert arm(redis, keys[44], race_ref, race_pause, claim='claim_new') == 0
        print('PASS:64 actual first submission contenders produce exactly one durable barrier ACK;new claim cannot rearm')

        for scenario in ('claim','binding','review','deadline','rollback','price','digest','pause','due','annual','source','pending','cash','overflow','owner-index'):
            ref = intent_refs[1]
            pause = intent_ready(keys[43], ref)
            assert intent_claim(redis, keys[43], ref, pause)[0] == 1
            over = {}
            if scenario == 'claim': over['claim'] = 'claim_foreign'
            elif scenario == 'binding': over['binding'] = 'changed'
            elif scenario == 'review': over['review'] = 'changed'
            elif scenario == 'deadline': over['now'] = 1800000301
            elif scenario == 'rollback': over['now'] = 1800000000
            elif scenario == 'price': over['price'] = 'not-a-price'
            elif scenario == 'digest': over['digest'] = 'z' * 64
            elif scenario == 'pause': redis.command('SET', 'nl:pause:' + ref, pause + ' ')
            elif scenario == 'due': redis.command('ZADD', 'nl:pause:due', 1800000003, ref)
            elif scenario == 'annual': redis.command('DEL', 'nl:pause:last:' + ref)
            elif scenario == 'source': redis.command('HSET', keys[43], 'active:restart-store', 'changed')
            elif scenario == 'pending': redis.command('HSET', keys[43], 'pending:restart-store', 'ctr_other')
            elif scenario == 'cash': redis.command('HSET', keys[43], 'reserved', 89)
            elif scenario == 'owner-index': redis.command('HSET',keys[43],'restart-owner:ctr_restart_source','ctr_foreign')
            elif scenario == 'overflow':
                raw = redis.command('HGET', keys[43], 'restart-intent:ctr_restart_new')
                redis.command('HSET', keys[43], 'restart-intent:ctr_restart_new', raw + ' ' * 4097)
            snapshot_before = snapshot(keys[43])
            assert arm(redis, keys[43], ref, pause, **over) == 0, scenario
            assert snapshot(keys[43]) == snapshot_before, scenario
        print('PASS:15 foreign, stale, changed, incomplete, index and oversize barrier cases preserve exact ledger evidence')

        # A result ID is evidence, not a new submission or rights activation.
        # Policy/month/deadline changes must not discard an already observed ID.
        ref = intent_refs[0]
        pause = intent_ready(keys[42], ref)
        assert intent_claim(redis, keys[42], ref, pause)[0] == 1
        assert arm(redis, keys[42], ref, pause)[0] == 1
        redis.command('HSET', keys[42], 'policy', 'next-month-policy', 'review', 'next-month-review')
        before_result = snapshot(keys[42])
        original = json.loads(redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new'))
        def record_result(client, subscription='sub_ObservedRestart01', **over):
            options = dict(grant='ctr_restart_new', review='review', stats='restart-store',
                           claim='claim_first', price='price_SyntheticRestart01', digest='a' * 64,
                           now=1803000000, armed=1800000002)
            options.update(over)
            return client.command('EVAL', result_script, 1, keys[42],
                                  options['grant'],options['review'],options['stats'],options['claim'],
                                  options['price'],options['digest'],subscription,options['now'],options['armed'])
        count_before = command_counts()
        assert record_result(redis) == 1
        record_counts = difference(count_before, command_counts())
        assert sum(record_counts.values()) <= 17
        known = json.loads(redis.command('HGET', keys[42], 'restart-intent:ctr_restart_new'))
        assert known['submission']['phase'] == 'observed'
        assert known['submission']['subscriptionId'] == 'sub_ObservedRestart01'
        assert known['submission']['observedAt'] == 1803000000
        expected_submission = {**original['submission'], 'phase':'observed',
                               'subscriptionId':'sub_ObservedRestart01','observedAt':1803000000}
        assert known.pop('submission') == expected_submission
        assert known == {name:value for name,value in original.items() if name != 'submission'}
        stored_before_duplicates = snapshot(keys[42])
        def result_duplicate(_index):
            client = Redis()
            try:
                return record_result(client)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            assert list(pool.map(result_duplicate, range(64))) == [2] * 64
        assert snapshot(keys[42]) == stored_before_duplicates
        assert record_result(redis, 'sub_ForeignResult01') == 0
        for field,value in [('grant','ctr_foreign'),('review','foreign'),('stats','foreign'),
                            ('claim','claim_foreign'),('price','price_Foreign01'),('digest','b'*64),
                            ('now',1800000001),('armed',1800000001)]:
            assert record_result(redis, **{field:value}) == 0, field
            assert snapshot(keys[42]) == stored_before_duplicates
        for field,value in before_result:
            if field != 'restart-intent:ctr_restart_new':
                assert redis.command('HGET', keys[42], field) == value
        assert redis.command('TTL', keys[42]) == -1
        print('PASS:durable result ID retained after deadline/policy-month change;64sameIDduplicates are evidence ACK2 only;foreign IDs/owners refuse')
        print('RESTART_RESULT_COMMANDS:' + json.dumps(record_counts, sort_keys=True))

        def recovery(client, key, record_ref, pause, **over):
            options = dict(stats='restart-store',source='sub_RestartSource01',source_grant='ctr_restart_source',
                           ref=record_ref,handle='synthetic-store',raw=pause,now=1800000003,binding='binding',review='review')
            options.update(over)
            return client.command('EVAL',recovery_script,4,key,'nl:pause:'+record_ref,'nl:pause:due','nl:pause:last:'+record_ref,
                                  *[options[name] for name in ('stats','source','source_grant','ref','handle','raw','now','binding','review')])
        ref = intent_refs[0]
        pause = intent_ready(keys[42],ref)
        # Fresh synthetic source with no reservation or intent, not a release
        # operation: seed only this generated fixture ledger from its origin.
        seed_restart(keys[42])
        before = snapshot(keys[42])
        assert recovery(redis,keys[42],ref,pause) == ['absent']
        assert snapshot(keys[42]) == before
        assert recovery(redis,keys[42],ref,pause,binding='old-policy') == 0
        assert take_restart(redis,keys[42]) == 1
        assert recovery(redis,keys[42],ref,pause) == 0  # pre-index pending is unknown
        assert intent_claim(redis,keys[42],ref,pause)[0] == 1
        assert redis.command('HGET',keys[42],'restart-owner:ctr_restart_source') == 'ctr_restart_new'
        assert recovery(redis,keys[42],ref,pause) == ['held']  # claim ACK lost before arm
        index_before = snapshot(keys[42])
        redis.command('HDEL',keys[42],'pending:restart-store')
        without_pending = snapshot(keys[42])
        assert take_restart(redis,keys[42],nonce='ctr_new_owner') == 0
        assert snapshot(keys[42]) == without_pending
        assert recovery(redis,keys[42],ref,pause) == 0
        redis.command('HSET',keys[42],'pending:restart-store','ctr_restart_new')
        assert snapshot(keys[42]) == index_before
        assert arm(redis,keys[42],ref,pause)[0] == 1
        before_recovery = snapshot(keys[42])
        initial = json.loads(redis.command('HGET',keys[42],'restart-intent:ctr_restart_new'))
        counts = command_counts()
        first_recovery = recovery(redis,keys[42],ref,pause)  # Deliberately ignore this provider-read allowance.
        recovery_counts = difference(counts,command_counts())
        assert first_recovery[0] == 'read'
        assert sum(recovery_counts.values()) <= 17
        def recovery_race(_index):
            client = Redis()
            try:
                return recovery(client,keys[42],ref,pause)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            attempts = list(pool.map(recovery_race,range(64)))
        assert sum(value[0] == 'read' for value in attempts) == 2
        assert sum(value == ['held'] for value in attempts) == 62
        after = json.loads(redis.command('HGET',keys[42],'restart-intent:ctr_restart_new'))
        assert after['submission']['recoveryReads'] == 3
        assert after['submission']['lastRecoveryAt'] == 1800000003
        assert after['submission']['phase'] == 'uncertain'
        after['submission'].pop('recoveryReads')
        after['submission'].pop('lastRecoveryAt')
        assert after == initial
        for field,value in before_recovery:
            if field != 'restart-intent:ctr_restart_new':
                assert redis.command('HGET',keys[42],field) == value
        assert recovery(redis,keys[42],ref,pause,now=1803000000) == ['held']
        assert arm(redis,keys[42],ref,pause) == 0
        print('PASS:permanent source index blocks a new owner even without pending;ignored recoveryACK+64contenders consume at most3lifetime provider reads')
        print('RESTART_RECOVERY_COMMANDS:'+json.dumps(recovery_counts,sort_keys=True))

        for scenario in ('raw','ref','handle','source','grant','due','annual','cash','index','rollback'):
            ref = intent_refs[1]
            pause = intent_ready(keys[43],ref)
            assert intent_claim(redis,keys[43],ref,pause)[0] == 1
            assert arm(redis,keys[43],ref,pause)[0] == 1
            over = {}
            if scenario == 'raw': over['raw'] = pause+' '
            elif scenario == 'ref': over['ref'] = 'foreign'
            elif scenario == 'handle': over['handle'] = 'foreign-store'
            elif scenario == 'source': over['source'] = 'sub_ForeignRecover01'
            elif scenario == 'grant': over['source_grant'] = 'ctr_foreign'
            elif scenario == 'due': redis.command('ZADD','nl:pause:due',1800000004,ref)
            elif scenario == 'annual': redis.command('DEL','nl:pause:last:'+ref)
            elif scenario == 'cash': redis.command('HSET',keys[43],'reserved',89)
            elif scenario == 'index': redis.command('HSET',keys[43],'restart-owner:ctr_restart_source','ctr_missing')
            elif scenario == 'rollback': over['now'] = 1800000001
            before = snapshot(keys[43])
            assert recovery(redis,keys[43],ref,pause,**over) == 0,scenario
            assert snapshot(keys[43]) == before,scenario
        print('PASS:10unknown/foreign/missing/cash/clock recovery cases retain every ledger field')

        ref = intent_refs[0]
        pause = intent_ready(keys[42],ref)
        assert intent_claim(redis,keys[42],ref,pause)[0] == 1
        assert arm(redis,keys[42],ref,pause)[0] == 1
        assert record_result(redis) == 1
        redis.command('HSET',keys[42],'policy','changed-after-submission','review','changed-after-submission')
        known_before = snapshot(keys[42])
        acknowledged = recovery(redis,keys[42],ref,pause,now=1803000001,binding='',review='')
        assert acknowledged[0] == 'read'
        known = json.loads(acknowledged[1])
        assert known['submission']['phase'] == 'observed'
        assert known['submission']['subscriptionId'] == 'sub_ObservedRestart01'
        assert known['submission']['recoveryReads'] == 1
        for field,value in known_before:
            if field != 'restart-intent:ctr_restart_new':
                assert redis.command('HGET',keys[42],field) == value
        print('PASS:known durable result ID remains readable after policy/month/deadline without creating submission permission')


    finally:
        for ref in intent_refs:
            if not ref.startswith('synthetic-restart-intent-'):
                raise RuntimeError('Refuse unrelated synthetic pause cleanup')
            redis.command('DEL', 'nl:pause:' + ref, 'nl:pause:last:' + ref)
            redis.command('ZREM', 'nl:pause:due', ref)
        for key in keys:
            if not key.startswith(prefix):
                raise RuntimeError('Refuse cleanup outside this generated CI namespace')
            redis.command('DEL', key)
        redis.close()


if __name__ == '__main__':
    main()
