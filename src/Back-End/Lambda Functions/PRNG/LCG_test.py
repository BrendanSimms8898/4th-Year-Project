import unittest
from unittest.mock import patch
from datetime import datetime
from LCG import get_seed, LCG_Main, LCG_Test

class LCGTests(unittest.TestCase):

    def test_get_seed(self):
    # Mocking datetime.now() to return a fixed datetime for testing
        with patch('LCG.datetime') as mock_datetime:
        # Set a fixed datetime value for testing
            mock_datetime.now.return_value = datetime(2023, 5, 5, 12, 30, 15)
        
        # Get the seed
            seed = get_seed()
        
        # Calculate the valid range of the seed based on the current time
            current_time_in_seconds = 12 * 60 * 60 + 30 * 60 + 15
            valid_min = 0
            valid_max = current_time_in_seconds - 1
        
        # Check if the seed is within the valid range
            self.assertGreaterEqual(seed, valid_min)
            self.assertLess(seed, valid_max)


    def test_LCG_Main(self):
        # Test the LCG_Main function
        final_number = LCG_Main()
        self.assertGreater(final_number, 0)  # The final number should be greater than 0
        self.assertLessEqual(final_number, 90)

    def test_LCG_Test(self):
        # Test the LCG_Test function
        test_results = LCG_Test()
        self.assertEqual(len(test_results), 20001)  # The test should return 20000 results

        # Check if all numbers in the test results are within the range of the modulus
        m = 2 ** 6 + 3 ** 3
        for number in test_results:
            self.assertGreaterEqual(number, 0)
            self.assertLess(number, m)

if __name__ == '__main__':
    unittest.main()
