"""Execute contract cash admission against disposable loopback CI Redis only."""
import concurrent.futures
import os
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
    prefix = 'marktmorgen:integration:contract:' + uuid.uuid4().hex + ':'
    keys = [prefix + str(i) for i in range(37)]
    redis = Redis()
    def snapshot(key):
        fields = redis.command('HGETALL', key)
        assert len(fields) % 2 == 0
        # Hash iteration order is unspecified; compare every field/value pair.
        return sorted(zip(fields[::2], fields[1::2]))
    def seed(key, carried=0):
        redis.command('HSET', key, 'review', 'review', 'policy', 'binding', 'reserved', carried, 'carried', carried, 'slots:creator_month', 2, 'slots:creator_year', 2)
    def take(client, key, store='one', nonce='ctr_one', choice='creator_month', charge=50, limit=100, carry=0, binding='binding', action='checkout', source_subscription='', now=1800000001):
        receipt = '|'.join(map(str, ['review', store, choice, action, charge, 1800000300, 1800003600, 1800086400, 2000000000000]))
        return client.command('EVAL', script, 1, key, binding, 'review', store, choice, charge, limit, carry, 2, nonce, receipt, action, source_subscription, now)
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

    finally:
        for key in keys:
            if not key.startswith(prefix):
                raise RuntimeError('Refuse cleanup outside this generated CI namespace')
            redis.command('DEL', key)
        redis.close()


if __name__ == '__main__':
    main()
