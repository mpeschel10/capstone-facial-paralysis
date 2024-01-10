import argparse, os, time, signal, subprocess
import logging, traceback
import datetime, json

import inspect


from test_lib import SERVER_URL
from test_lib import repo_dir, test_dir
server_pid_path = test_dir.joinpath('run', 'server_pid')

import logging
logger = logging.getLogger('test')


from test_api import chomp_left, jwt_to_dict

from test_lib import reset_db, reset_uploads

from test_lib import login, logout
from test_lib import subseteq, test

import requests
from requests.adapters import HTTPAdapter, Retry
def await_server():
    # From https://stackoverflow.com/a/35504626
    # Begin copyrighted material
    s = requests.Session()

    retries = Retry(total=10,
                    backoff_factor=0.1,
                    status_forcelist=[ 500, 502, 503, 504 ])

    s.mount('http://', HTTPAdapter(max_retries=retries))
    # End of copyrighted material
    # See LICENSE.md for details

    logger.debug('Awaiting server at %s' % SERVER_URL)
    s.get(SERVER_URL)
    logger.info('Server ready.')

from test_api import test_api_login, test_api_user, test_file_visibility, test_api_image_get_list, test_api_image

def main(test_methods=None):
    '''Performs tests on the facial-analytics server. Prints failures to console.

    Assumes the server is up and running at url %s.
    ''' % SERVER_URL

    if test_methods == None:
        def __f(): pass
        function = type(__f)
        globals = inspect.currentframe().f_globals
        test_methods = [value for key, value in globals.items() if key.startswith("test_") and type(value) == function]
    
    logger.debug('Start of main.')

    reset_uploads()
    reset_db()
    
    all_ok = True
    for test_method in test_methods:
        try:
            result = test_method()
            all_ok = all_ok and result
            if result:
                logger.info(f'Test method {test_method.__name__} OK')
            else:
                break
        except Exception as e:
            logger.error(f'Failure on test method {test_method.__name__}: Got exception {e}')
            print(traceback.format_exc())
            all_ok = False
            break

    logger.debug('End of main.')
    logger.info('All tests finished; %s', 'all OK' if all_ok else 'some errors')



if __name__ == '__main__':
    # At the moment, the server creation stuff only works on my specific Arch machine.
    # Feel free to add Windows stuff as necessary.

    os.chdir(repo_dir)

    parser = argparse.ArgumentParser()
    parser.add_argument('--make-server', action='store_true')
    parser.add_argument('--keep-server', action='store_true')
    parser.add_argument('--log-level', default='INFO', choices=logging.getLevelNamesMapping().keys())
    args = parser.parse_args()

    logging.basicConfig(level=logging.CRITICAL) # Suppress URLLib3 warning about timeouts
    logger.setLevel(getattr(logging, args.log_level.upper()))
    
    if args.make_server:
        # Launch the server in a new window, for neatness.
        # launch_server.sh will server the PID in a test/run/server_pid so we can kill it later.
        p = subprocess.Popen(['gnome-terminal', '--', test_dir.joinpath('run_server.sh')])
    else:
        p = None

    try:
        await_server()
        main(None)
    except BaseException as e:
        # print('Exception:', e)
        raise e
    finally:
        if not p is None and not args.keep_server:
            time.sleep(2) # If there's an immediate exception, launch_server.sh will not write pid in time.
            server_pid = int(server_pid_path.open().read())
            os.kill(server_pid, signal.SIGTERM)
