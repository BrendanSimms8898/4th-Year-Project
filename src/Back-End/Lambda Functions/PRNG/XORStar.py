from datetime import *
import secrets


mask64 = (1 << 512) - 1
mask32 = (1 << 256) - 1
const = 0x2545F4914F6CDD1D

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

def state(seed):
    state = 0 & mask64
    state = seed & mask64
    return state

def next_num():
    x = state(get_seed())
    x = (x ^ (x >> 12)) & mask64
    x = (x ^ (x << 25)) & mask64
    x = (x ^ (x >> 27)) & mask64
    answer = (((x * const) & mask64) >> 32) & mask32
    return answer

def binary_to_decimal(n):
    return int(n,2)

def decimalToBinary(n):
    i = 0
    x = bin(n).replace("0b", "")
    y = []
    for i in range(0, len(x), 7):
        if binary_to_decimal(x[i:i+7]) != 0 and binary_to_decimal(x[i:i+7]) < 90:
            y.append(x[i:i+7])
    binary_num = secrets.choice(y)
    return binary_num

def XORStarMain():
    x = next_num()
    while len(str(x)) < 7:
        x = next_num()
    x = decimalToBinary(x)
    FinalAnswer = binary_to_decimal(x)
    return FinalAnswer

def XORStarTest():
    test_count = 20000
    test_results = []

    while len(test_results) <= test_count:
        Result = XORStarMain()
        test_results.append(Result)
    return test_results
