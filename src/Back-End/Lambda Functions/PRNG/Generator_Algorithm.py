from datetime import datetime
from math import *
from BBS import *
from LCG import *
from XORStar import *




def Decide_Algorithim():
    
    now = datetime.now()
    
    time = datetime.now()
    
    current_seconds = int(now.strftime('%S'))
    
    if current_seconds % 2 == 0:
            result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
            return result
            
    elif current_seconds % 3 == 0:
        result = BBS_Main()
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
        
    elif current_seconds % 5 == 0:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result
            
    elif current_seconds % 7 == 0:
        result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result
            
    elif current_seconds % 11 == 0:
        result = BBS_Main()
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
            
    elif current_seconds % 13 == 0:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result
            
    elif current_seconds % 17 == 0: 
        result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result
            
    elif current_seconds % 19 == 0:
        result = BBS_Main() 
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
            
    elif current_seconds % 23 == 0:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result
            
    elif current_seconds % 29 == 0:
        result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result
            
    elif current_seconds % 31 == 0:
        result = BBS_Main() 
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
            
    elif current_seconds % 37 == 0:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result
            
    elif current_seconds % 41 == 0:
        result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result
            
    elif current_seconds % 43 == 0:
        result = BBS_Main()
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
            
    elif current_seconds % 47 == 0:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result
            
    elif current_seconds % 53 == 0:
        result = LCG_Main()
            # Used for generating Sequence for testing
            # result = LCG_Test()
        return result
        
    elif current_seconds % 59 == 0:
        result = BBS_Main()
            # Used for generating Sequence for testing
            # result = BBS_Test()
        return result
            
    else:
        result = XORStarMain()
            # Used for generating Sequence for testing
            # result = XORStarTest()
        return result

print(Decide_Algorithim())