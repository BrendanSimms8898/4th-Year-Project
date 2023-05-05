import unittest
from datetime import datetime
import secrets

from XORStar import *

class TestXORStar(unittest.TestCase):

    def test_get_seed(self):
        seed = get_seed()
        self.assertIsInstance(seed, int)

    def test_state(self):
        seed = get_seed()
        state_value = state(seed)
        self.assertIsInstance(state_value, int)
        self.assertLessEqual(state_value, mask64)

    def test_next_num(self):
        num = next_num()
        self.assertIsInstance(num, int)
        self.assertLessEqual(num, mask32)

    def test_binary_to_decimal(self):
        decimal_num = binary_to_decimal("1010101")
        self.assertEqual(decimal_num, 85)
        self.assertIsInstance(decimal_num, int)

    def test_decimalToBinary(self):
        binary_num = decimalToBinary(85)
        self.assertEqual(binary_num, "1010101")
        self.assertIsInstance(binary_num, str)


    def test_XORStarMain(self):
        result = XORStarMain()
        self.assertLessEqual(result, 90)
        self.assertIsInstance(result, int)

if __name__ == '__main__':
    unittest.main()
