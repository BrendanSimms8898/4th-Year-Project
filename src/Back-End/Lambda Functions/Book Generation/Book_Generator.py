import secrets
from timeit import default_timer

#Resets all Data Structure for stroing Tickets and Books to Empty
def Restart(Book, Ticket_One, Ticket_Two, Ticket_Three, Ticket_Four, Ticket_Five, Ticket_Six):
    Book.clear()
    Ticket_One.clear()
    Ticket_Two.clear()
    Ticket_Three.clear()
    Ticket_Four.clear()
    Ticket_Five.clear()
    Ticket_Six.clear()

# Append contents of the Lists of Lines back into the Numbers List used to contain all Numbers between 1-90 for one Book Generation
def ClearLinesOfTicket(x, y, z, Numbers):
    for item in x:
        Numbers.append(item)

    for item in y:
        Numbers.append(item)

    for item in z:
        Numbers.append(item)

# Fills a List with all Numbers between 1-90 and returns it
def FillNumbersList():
    x = 1
    Numbers = []

    while x <= 90:
        Numbers.append(x)
        x += 1 
    return Numbers

# Function for appending Tuples of Numbers into the Lines of a Ticket returns the Ticket (x)
def AppendTickets(x, first_line_tuple, second_line_tuple, third_line_tuple):
    x.append(first_line_tuple)
    x.append(second_line_tuple)
    x.append(third_line_tuple)
    
    return x

# Calculates the Lower Limits of the number (x) and returns it,  the Lower imits are defined as rounding down to the nearest 10  or 0 and adding one to it
#This is used to ensure that two numbers of the same lowerlimit cannot be appended to the same line of a ticket i.e 1 and 7 cannot be on the same line
def CalculateLimits(x):
    # Gives the Second digit of the number example: 87 % 10 = 7
    x_mod = x % 10

    # If statement to ensure when mod = 0 lower limit is still calculated correctly
    if x_mod != 0:
        # Calculates the number (x) lower limit by taking x_mod away from x and adding 1
        x_lower_limit = (x - x_mod) + 1
    else:
        # Calculates the lower limit by taking away 9 from original number x
        x_lower_limit = x - 9

    return x_lower_limit

# Checks the Possibility of a Ticket being able to be created for the final ticket by comparing the LowerLimits for each number in the list to all the numbers in the list
# If there are more than 4 instances where this comparison is true it is impossible to generate the final ticket
def CheckPossibility(Numbers, x):
    
    i = 0
    Possible = True
    while i < len(Numbers):
        counter = 0
        tmp = Numbers[i]
        for item in Numbers:
            if CalculateLimits(tmp) == CalculateLimits(item):
                counter += 1
            
        if counter >= x:
            Possible = False

        i += 1
        
    if Possible == True:
        return True

    else:
        return False
              
# Used to Populate the Tickets within a Book, Tickets are stored in the form of a list with a tuple denoting each line
def PopulateTickets(Numbers, Book, Ticket_One, Ticket_Two, Ticket_Three, Ticket_Four, Ticket_Five, Ticket_Six):

    # If on the final run of PopulaateTickets
    if len(Numbers) == 15:
        # If it is possible
        if CheckPossibility(Numbers, 4) == True:
            pass
        #If its not possible restart the entire process
        else:
            Restart(Book, Ticket_One, Ticket_Two, Ticket_Three, Ticket_Four, Ticket_Five, Ticket_Six)
            Numbers.clear()
            new_number_list = FillNumbersList()
            for item in new_number_list:
                Numbers.append(item)

    first_line = []
    second_line = []
    third_line = []

    # CSPRNG choice of item from our List of Numbers from (1-90)at the begining
    number = secrets.choice(Numbers)

    # Fills the first Line of the ticket
    while len(first_line) < 5:
        range_exists = False
        # If not the base case of an empty list
        if len(first_line) != 0:
            for item in first_line:
                # If an item in the list belongs to the same range as our number to be put into the list
                if CalculateLimits(item) == CalculateLimits(number):
                    # Set Variable range_exists
                    range_exists = True
        # If the range does exist do this
        if range_exists == True:
            number = secrets.choice(Numbers)
        # If there is no conflict of ranges or list is empty
        else:
            # Add the number to the line, remove the number from the original Numbers List of [1-90] and select new number from the Numbers List
            first_line.append(number)
            Numbers.remove(number)
            number = secrets.choice(Numbers)

    Breaks_On_Second_Line_Run = False
    
    if len(Numbers) == 10:
        # If it is possible
        if CheckPossibility(Numbers, 3) == True:
            pass
        #If its not possible restart the entire process
        else:
            Breaks_On_Second_Line_Run = True
            Restart(Book, Ticket_One, Ticket_Two, Ticket_Three, Ticket_Four, Ticket_Five, Ticket_Six)
            Numbers.clear()
            new_number_list = FillNumbersList()
            for item in new_number_list:
                Numbers.append(item)

    # Repeats the Above for the second Line    
    while len(second_line) < 5 and Breaks_On_Second_Line_Run != True:
        range_exists = False
        if len(second_line) != 0:
            for item in second_line:
                if CalculateLimits(item) == CalculateLimits(number):
                    range_exists = True
        if range_exists == True:    
            number = secrets.choice(Numbers)
        else:
            second_line.append(number)
            Numbers.remove(number)
            number = secrets.choice(Numbers)

    # Repeats the Above for the Third Line            
    while len(third_line) < 5 and Breaks_On_Second_Line_Run != True:
        range_exists = False
        if len(third_line) != 0:
            for item in third_line:
                if CalculateLimits(item) == CalculateLimits(number):
                    range_exists = True
        if range_exists == True:
            number = secrets.choice(Numbers)
            # Additional Case for when Numbers List has 5 items in it as if a range collision occurs here we need to restart for the ticket
            if len(Numbers) < 5:
                # Appends the Lists to Numbers List then empties them
                ClearLinesOfTicket(first_line, second_line, third_line, Numbers)
                first_line.clear()
                second_line.clear()
                third_line.clear()

                break
        else:
            third_line.append(number)
            Numbers.remove(number)
            # Prevents Error by not selecting a new number when Number List is empty
            if len(Numbers) !=0:
                number = secrets.choice(Numbers)
    
    # Sorts the Lists by accsending numerical order
    first_line.sort()
    second_line.sort()
    third_line.sort()

    # Makes the Lists a tuple if theyre not empty
    if len(first_line) != 0:
        first_line_tuple = tuple(first_line)
    if len(second_line) != 0:
        second_line_tuple = tuple(second_line)
    if len(third_line) != 0:
        third_line_tuple = tuple(third_line)
    
    # Appends the Lines to a ticket depending on the length of Numbers List
    if len(first_line) != 0 and len(second_line) != 0 and third_line != 0:
        if len(Numbers) == 75:
            AppendTickets(Ticket_One, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_One)
        elif len(Numbers) == 60:
            AppendTickets(Ticket_Two, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_Two)
        elif len(Numbers) == 45:
            AppendTickets(Ticket_Three, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_Three)
        elif len(Numbers) == 30:
            AppendTickets(Ticket_Four, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_Four)
        elif len(Numbers) == 15:
            AppendTickets(Ticket_Five, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_Five)
        else:
            AppendTickets(Ticket_Six, first_line_tuple, second_line_tuple, third_line_tuple)
            Book.append(Ticket_Six)
    
    first_line = []
    second_line = []
    third_line = []   
    
    return Book

def Test_Book_Generation():
    test_count = 50000
    i = 0
    
    while i < test_count:
        GenerateBook()
        i += 1
    
    
def GenerateBook():    
    Total_Books = []
    Book = []

    Ticket_One = []
    Ticket_Two = []
    Ticket_Three = []
    Ticket_Four = []
    Ticket_Five = []
    Ticket_Six = []

    Numbers = FillNumbersList()


    while len(Numbers) != 0:
        PopulateTickets(Numbers, Book, Ticket_One, Ticket_Two, Ticket_Three, Ticket_Four, Ticket_Five, Ticket_Six)

    print(Book)

GenerateBook()


# Used For Testing
# Test_Book_Generation()
