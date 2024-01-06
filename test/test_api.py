import logging
logger = logging.getLogger('test')

import requests

from test_lib import cat_image_path, badger_image_path, beaver_image_path, dog_image_path, owl_image_path
from test_lib import SERVER_URL
from test_lib import login, logout

def test_file_visibility():
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
