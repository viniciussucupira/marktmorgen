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
    prefix = 'marktmorgen:integration:contract:' + uuid.uuid4().hex + ':'
    keys = [prefix + str(i) for i in range(12)]
    redis = Redis()
    def seed(key, carried=0):
        redis.command('HSET', key, 'review', 'review', 'policy', 'binding', 'reserved', carried, 'carried', carried, 'slots:creator_month', 2, 'slots:creator_year', 2)
    def take(client, key, store='one', nonce='ctr_one', choice='creator_month', charge=50, limit=100, carry=0, binding='binding'):
        return client.command('EVAL', script, 1, key, binding, 'review', store, choice, charge, limit, carry, 2, nonce, 'receipt:' + store + ':' + choice)
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
        before = redis.command('HGETALL', keys[3])
        assert take(redis, keys[3], 'other', 'ctr_other', limit=200, carry=100) == 0
        assert redis.command('HGETALL', keys[3]) == before
        print('PASS: carried obligations cannot be reset to finance another contract')
        seed(keys[4])
        assert take(redis, keys[4], limit=75) == 1
        before = redis.command('HGETALL', keys[4])
        assert take(redis, keys[4], 'other', 'ctr_other', limit=75) == 0
        assert redis.command('HGETALL', keys[4]) == before
        print('PASS: the company cash ceiling blocks a grant without changing any field')
        for key, field, value in [(keys[5], 'reserved', '-1'), (keys[6], 'slots:creator_month', '3'), (keys[7], 'policy', 'changed')]:
            seed(key)
            redis.command('HSET', key, field, value)
            before = redis.command('HGETALL', key)
            assert take(redis, key) == 0
            assert redis.command('HGETALL', key) == before
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
            before = redis.command('HGETALL', keys[11])
            assert take(redis, keys[11], charge=charge) == 0
            assert redis.command('HGETALL', keys[11]) == before
        print('PASS: zero, fractional, noncanonical and unsafe charges cannot create a grant')
    finally:
        for key in keys:
            if not key.startswith(prefix):
                raise RuntimeError('Refuse cleanup outside this generated CI namespace')
            redis.command('DEL', key)
        redis.close()


if __name__ == '__main__':
    main()
