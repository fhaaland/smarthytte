import random as r

volt = 11.5 + (r.randrange(0, 2000)/2000)
amps = 0.01 + (r.randrange(0, 1000)/2000)

print("{\"volt\":", volt, ",\"amp\": ", amps, "}")