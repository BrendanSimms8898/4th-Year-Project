from datetime import datetime
import secrets
def get_seed():
    now = datetime.now()
    
    time = datetime.now()
    
    current_hours = now.strftime("%H")
    current_hours = int(current_hours)
    current_hours = current_hours * 60 * 60 
    
    current_minutes = now.strftime("%M")
    current_minutes = int(current_minutes)
    current_minutes =  current_minutes * 60
    
    current_seconds = now.strftime("%S")
    current_seconds = int(current_seconds)
    
    current_time_in_seconds = current_hours + current_minutes + current_seconds

    seed = secrets.randbelow(current_time_in_seconds)

    return seed
    
def LCG_Main():
    FinalNumber = 0
    while (FinalNumber == 0):
        seed = get_seed()
        # Increment
        c = 11
        #Multiplier
        a = 31
        # Modulus
        m = 2 ** 6 + 3 ** 3
        
        MultiplierNumber = a * seed
        
        IncrementedNumber = MultiplierNumber + c
        
        FinalNumber = IncrementedNumber % m
            
    return FinalNumber

def LCG_Test():
    test_results = []
    test_count = 20000
            
    while len(test_results) <= test_count:
        FinalNumber = LCG_Main()
        test_results.append(FinalNumber)
    return test_results

