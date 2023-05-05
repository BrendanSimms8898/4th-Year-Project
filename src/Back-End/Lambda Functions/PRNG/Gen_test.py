import unittest

# Import the modules containing the algorithm functions
from BBS import BBS_Main
from LCG import LCG_Main
from XORStar import XORStarMain

# Import the function to be tested
from Generator_Algorithm import Decide_Algorithim

class AlgorithmTestCase(unittest.TestCase):
    def test_algorithm_selection(self):
        # Test the LCG algorithm
        result = Decide_Algorithim()
        self.assertIsNotNone(result)
        self.assertIsInstance(result, int)  # Adjust the expected result type accordingly
        
        # Test the BBS algorithm
        result = Decide_Algorithim()
        self.assertIsNotNone(result)
        self.assertIsInstance(result, int)  # Adjust the expected result type accordingly
        
        # Test the XOR algorithm
        result = Decide_Algorithim()
        self.assertIsNotNone(result)
        self.assertIsInstance(result, int)  # Adjust the expected result type accordingly

if __name__ == '__main__':
    unittest.main()
