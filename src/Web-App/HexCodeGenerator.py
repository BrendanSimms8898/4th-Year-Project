import secrets

def HexCodeGenerator():
    ListOfHexDigits = ['0', '1', '2' , '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

    HexString = secrets.choice(ListOfHexDigits)

    i = 0
    while i < 63:
        next_digit = secrets.choice(ListOfHexDigits)
        HexString = HexString + next_digit

        i += 1
    
    return(HexString)

print(HexCodeGenerator())