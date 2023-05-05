import secrets
from math import *
from datetime import datetime

#function to generate a seed using datetime
def get_seed():
    now = datetime.now()
    
    time = datetime.now()
#changing current time into total seconds
    current_hours = now.strftime("%H")
    current_hours = int(current_hours)
    current_hours = current_hours * 60 * 60 
    
    current_minutes = now.strftime("%M")
    current_minutes = int(current_minutes)
    current_minutes =  current_minutes * 60
    
    current_seconds = now.strftime("%S")
    current_seconds = int(current_seconds)
    
    current_time_in_seconds = current_hours + current_minutes + current_seconds
#picks a random number between 1 and the current time in seconds using secrets which is a cryptography prng function and chooses that as our seed
    seed = secrets.randbelow(current_time_in_seconds)

    return seed

def is_prime(number):
    # 1 is a special case of not prime
    if number <= 1:
        return False
    # 2 is a special case of a prime
    if number == 2:
        return True
    # check if the number divides by 2 with no remainder
    if number % 2 == 0:
        return False
    # limit on divisors we test, sqrt of n, +1 so range() will reach it
    limit = floor(sqrt(number)) + 1
    # check for evenly divisible for odd numbers between 3 and sqrt(n)
    for i in range(3, limit, 2):
    # check if number is divisible with no remainder
        if number % i == 0:
            # number is divisible and is not a prime
            return False
    # number is probably prime
    return True

# function to generate primes from 2 to 10000
def get_primes():
    max = 10000
    primes = []
    #looping through the numbers and checking if they are prime using prime function then appending to our primes list
    for x in range(2, max + 1):
        if is_prime(x):
            primes.append(x)
    return primes

# function to check if the two number are co primes ie. only common factor is 1
def Co_Primes(x, y):
    while y != 0:
        x, y = y, (x % y)
    return x == 1

# function to generate M for the BBS formula
def get_M(seed):
    minimum = 7000
    primes = get_primes()
    while True:
        #generate p using secrets.choice which will randomly select a number from a list of primes
        p = secrets.choice(primes)
        if (((p % 4) == 3) and p > minimum):
            break
    while True:
        q = secrets.choice(primes)
        if (((q % 4) == 3) and q > minimum):
            if ((p != q) and Co_Primes(seed, p*q)):
                break
    return p * q

#function to generate random binary number
def gen_num(seed):
    m = get_M(seed)
    x = []
    z = []

    x.append((seed ** 2) % m)
    i = 0
    while i < 7:
        x.append((x[-1]**2) % m)
        z.append(x[-1] % 2)
        i += 1
    #creates a binary number using z array
    generated_number = ''.join(map(str, z))
    #changes final number to a decimal number
    FinalNumber = binary_to_decimal(generated_number)

    return FinalNumber

def binary_to_decimal(n):
    return int(n,2)


def BBS_Main():
    FinalNumber = 0
    #checking to see if final number is in the number range for bingo numbers 1-90
    while FinalNumber == 0 or FinalNumber > 90:
        seed = get_seed()
        FinalNumber = gen_num(seed)
    return FinalNumber


