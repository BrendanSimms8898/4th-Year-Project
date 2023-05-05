import unittest
from unittest.mock import MagicMock
import secrets
from timeit import default_timer
import copy
from Book_Generator import *

class TicketGenerationTest(unittest.TestCase):

    def setUp(self):
        self.test_numbers_list = [i for i in range(1, 91)]
        self.test_book = []
        self.test_ticket_one = []
        self.test_ticket_two = []
        self.test_ticket_three = []
        self.test_ticket_four = []
        self.test_ticket_five = []
        self.test_ticket_six = []

    def test_Restart(self):
        self.Book = [1, 2, 3, 4]
        self.Ticket_One = [5, 6, 7]
        self.Ticket_Two = []
        self.Ticket_Three = [] 
        self.Ticket_Four = [] 
        self.Ticket_Five = [] 
        self.Ticket_Six = []
        Restart(self.Book, self.Ticket_One, self.Ticket_Two, self.Ticket_Three, self.Ticket_Four, self.Ticket_Five, self.Ticket_Six)
        self.assertEqual(self.Book, [])
        self.assertEqual(self.Ticket_One, [])
        self.assertEqual(self.Ticket_Two, [])
        self.assertEqual(self.Ticket_Three, [])
        self.assertEqual(self.Ticket_Four, [])
        self.assertEqual(self.Ticket_Five, [])
        self.assertEqual(self.Ticket_Six, [])
        self.assertEqual(len(self.test_numbers_list), 90)

    def test_ClearLinesOfTicket(self):
        Numbers = [1, 2, 3, 4]
        x = [5, 6, 7]
        y = [8, 9]
        z = [10]
        ClearLinesOfTicket(x, y, z, Numbers)
        self.assertEqual(Numbers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    def test_CalculateLimits(self):
        result = CalculateLimits(1)
        self.assertEqual(result, 1)
        result = CalculateLimits(25)
        self.assertEqual(result, 21)
        result = CalculateLimits(10)
        self.assertEqual(result, 1)
        result = CalculateLimits(87)
        self.assertEqual(result, 81)

    def test_CheckPossibility(self):
        Numbers = [1, 2, 3, 4, 23, 24, 39, 45, 52, 61]
        result = CheckPossibility(Numbers, 3)
        self.assertFalse(result)
        Numbers = [1, 2, 13, 16, 21, 26, 31, 39, 42, 51]
        result = CheckPossibility(Numbers, 3)
        self.assertTrue(result)

    def test_AppendTickets(self):
        x = []
        first_line_tuple = (1, 2, 3, 4, 5)
        second_line_tuple = (6, 7, 8, 9, 10)
        third_line_tuple = (11, 12, 13, 14, 15)
        result = AppendTickets(x, first_line_tuple, second_line_tuple, third_line_tuple)
        self.assertEqual(result, [(1, 2, 3, 4, 5), (6, 7, 8, 9, 10), (11, 12, 13, 14, 15)])
       
    def test_generate_book(self):
        # Test the GenerateBook function
        book = GenerateBook()
        
        # Check if the book is not empty
        self.assertNotEqual(len(book), 0)
        
        # Check if the book has the expected number of tickets
        self.assertEqual(len(book), 6)
        
        # Check if each ticket has the expected number of lines
        for ticket in book:
            self.assertEqual(len(ticket), 3)
            
            # Check if each line has the expected number of numbers
            for line in ticket:
                self.assertEqual(len(line), 5)

if __name__ == '__main__':
    unittest.main()
