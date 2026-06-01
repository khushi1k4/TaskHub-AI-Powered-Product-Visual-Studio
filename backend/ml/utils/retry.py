import time

def retry(fn, retries=3, delay=2):

    last_error = None

    for i in range(retries):
        try:
            return fn()
        except Exception as e:
            last_error = e
            print(f"Retry {i+1} failed: {e}")
            time.sleep(delay)

    raise last_error