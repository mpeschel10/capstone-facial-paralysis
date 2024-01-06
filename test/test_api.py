import base64, json
import logging
logger = logging.getLogger('test')

import requests

from test_lib import SERVER_URL
from test_lib import login, logout
from test_lib import reset_db, reset_uploads
from test_lib import test


def urlsafe_b64decode_padded(s):
    return base64.urlsafe_b64decode(s + "=" * ((4 - len(s)) % 4))

def jwt_to_dict(jwt):
    json_str = urlsafe_b64decode_padded(jwt.split(".")[1])
    return json.loads(json_str)

def chomp_left(s, prefix):
    if not s.startswith(prefix): return None
    return s[len(prefix):]



def test_file_visibility():
    from test_lib import owl_image_path, beaver_image_path
    all_ok = True
    s = requests.Session()
    
    test_name = 'GET /api/image unauthenticated'
    observed_str = 's.get(f"{SERVER_URL}/api/image/badger.jpg").status_code'
    expected = 401
    
    logger.debug(f'Begin test {test_name}')
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    test_name = 'GET /api/image admin auth'
    observed_str = f's.get("{SERVER_URL}/api/image/owl.jpg").content'
    expected_str = 'owl_image_path.open("rb").read()'
    
    logger.debug(f'Begin test {test_name}')
    login(s, 'mpeschel', 'mpeschel_password')
    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        all_ok = False
    
    test_name = 'GET /api/image owner auth'
    observed_str = f's.get("{SERVER_URL}/api/image/beaver.jpg").content'
    expected_str = 'beaver_image_path.open("rb").read()'
    
    logger.debug(f'Begin test {test_name}')
    login(s, 'rculling', 'rculling_password')
    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        all_ok = False
    
    test_name = 'GET /api/image unauthorized'
    observed_str = f's.get("{SERVER_URL}/api/image/dog.jpg").status_code'
    expected = 403
    
    logger.debug(f'Begin test {test_name}')
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    return all_ok

def test_api_image_get_list():
    reset_uploads()
    reset_db()

    all_ok = True
    s = requests.Session()

    login(s, "mpeschel", "mpeschel_password") # cat badger beaver dog owl
    all_ok = all_ok and test(
        'GET /api/image admin',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 1, 'url': '/api/image/badger.jpg'}, {'id': 2, 'url': '/api/image/beaver.jpg'}, {'id': 3, 'url': '/api/image/dog.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    login(s, "rculling", "rculling_password") # beaver owl
    all_ok = all_ok and test(
        'GET /api/image rculling beaver owl',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 2, 'url': '/api/image/beaver.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    login(s, "radler", "radler_password") # dog owl
    all_ok = all_ok and test(
        'GET /api/image radler dog owl',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 3, 'url': '/api/image/dog.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    logout(s) # 401 Unauthorized
    all_ok = all_ok and test('GET /api/image unauthorized', 's.get(SERVER_URL + "/api/image").status_code', 401)

    return all_ok
