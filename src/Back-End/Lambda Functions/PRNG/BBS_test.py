import unittest
from datetime import datetime
from BBS import *

class TestBBS(unittest.TestCase):

    def test_get_seed(self):
        seed = get_seed()
        self.assertIsInstance(seed, int)

    def test_is_prime(self):
        self.assertFalse(is_prime(1))
        self.assertTrue(is_prime(2))
        self.assertTrue(is_prime(3))
        self.assertFalse(is_prime(4))
        self.assertTrue(is_prime(5))
        self.assertTrue(is_prime(7))
        self.assertFalse(is_prime(9))
        self.assertTrue(is_prime(11))
        self.assertFalse(is_prime(15))

    def test_get_primes(self):
        primes = get_primes()
        self.assertIsInstance(primes, list)
        self.assertTrue(all(is_prime(p) for p in primes))

    def test_Co_Primes(self):
        self.assertTrue(Co_Primes(5, 7))
        self.assertFalse(Co_Primes(8, 12))
        self.assertTrue(Co_Primes(13, 17))
        self.assertFalse(Co_Primes(15, 20))
        self.assertTrue(Co_Primes(21, 22))

    def test_get_M(self):
        seed = 123456
        M = get_M(seed)
        self.assertIsInstance(M, int)

    def test_gen_num(self):
        seed = 123456
        num = gen_num(seed)
        self.assertIsInstance(num, int)
        self.assertGreaterEqual(num, 0)
        self.assertLessEqual(num, 127)

    def test_BBS_Main(self):
        num = BBS_Main()
        self.assertIsInstance(num, int)
        self.assertGreaterEqual(num, 1)
        self.assertLessEqual(num, 90)

if __name__ == '__main__':
    unittest.main()
