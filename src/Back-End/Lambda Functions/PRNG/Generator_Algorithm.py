import secrets
from math import *
from BBS import *
from LCG import *
from XORStar import *

def Decide_Algorithim():
    
    Algorithims = []

    i = 0
    while i < 100:
        Algorithims.append("LCG")
        Algorithims.append("XOR")
        Algorithims.append("BBS")
        
        i += 1

    algorithim = secrets.choice(Algorithims)
    
    if algorithim == "LCG":
        result = LCG_Main()
        # Used for generating Sequence for testing
        # result = LCG_Test()
        return result

    elif algorithim == "BBS":
        result = BBS_Main()
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result

    elif algorithim == "XOR":        
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result

def fill_numbers_list(NumberList):
    i = 1
    
    while i <= 90:
        NumberList.append(i)
        i += 1
    
    return NumberList

def Test_Run():
    test_count = 200
    i = 0
    test_results = []


    while i < test_count:
        Result = Decide_Algorithim()
        test_results.append(Result)
        i += 1
    
    return test_results

#print(Decide_Algorithim())
print(Test_Run())

'''
Code for Testing

NumberList = []
Result = Test_Run()
fill_numbers_list(NumberList)

for item in Result:
    for x in NumberList:
        if item == x:
            NumberList.remove(x)

print(NumberList)

'''