"""Exercise command accounting on dedicated loopback CI Redis, never a provider.

The probe injects another client's PING at the former between-INFO boundary.
An atomic measurement must exclude that noise, retain Lua PING, and keep EVAL.
"""
import os
from test_form_opportunity_redis import Redis
from test_contract_funding_redis import measured_command


def main():
    if os.environ.get('MARKTMORGEN_REDIS_INTEGRATION') != '1':
        raise RuntimeError('Use dedicated CI Redis on loopback port 16379 only')
    client, noise = Redis(), Redis()
    try:
        def outside_ping():
            assert noise.command('PING') == 'PONG'
            return client.command('EVAL', 'return 1', 0)
        result, counts = measured_command(client, outside_ping)
        assert result == 1 and counts == {'eval': 1}, counts
        def lua_ping():
            assert noise.command('PING') == 'PONG'
            return client.command('EVAL', "return redis.call('PING')", 0)
        result, counts = measured_command(client, lua_ping)
        assert result == 'PONG' and counts == {'eval': 1, 'ping': 1}, counts
        # Unknown commands cannot silently disappear from the measured budget.
        result, counts = measured_command(client, lambda: client.command('EVAL', "return redis.call('DBSIZE')", 0))
        assert isinstance(result, int) and counts == {'eval': 1, 'dbsize': 1}, counts
        # A malformed probe is refused and never leaves this connection queued.
        try:
            measured_command(client, lambda: None)
            raise AssertionError('Missing application command must fail')
        except (AssertionError, RuntimeError):
            pass
        assert client.command('PING') == 'PONG'
        print('PASS: atomic INFO/EVAL/INFO excludes external PING, retains EVAL and every internal command; invalid probe leaves no transaction')
    finally:
        client.close()
        noise.close()


if __name__ == '__main__':
    main()
