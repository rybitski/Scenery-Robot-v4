import math

MAX_DELTA = 50 #the maximum power 

STEP_1 = 100
STEP_2 = 300
STEP_3 = 500


def get_power_set(err_theta,err_dist):
    #We don't really need this, but it could be helpful in the future
    focus_point = circ_swing(math.radians(err_theta),err_dist)

    power_offsets = [0,0] #move straight ahead

    if(err_theta<=30 and err_theta >= 0):
        power_offsets = [STEP_3,0]
    elif(err_theta<=60 and err_theta >= 30):
        power_offsets = [STEP_2,0]
    elif(err_theta<=80 and err_theta >= 60):
        power_offsets = [STEP_1,0]
    
    elif(err_theta<=100 and err_theta>=80):
        power_offsets = [0,0]

    elif(err_theta<=120 and err_theta >= 90):
        power_offsets = [0,STEP_1]
    elif(err_theta<=150 and err_theta >= 120):
        power_offsets = [0,STEP_2]
    elif(err_theta<=180 and err_theta >= 150):
        power_offsets = [0,STEP_3]

    return power_offsets


#Takes an x-axis alligned point and swings it into circle position...NOTE: Provde theta in radians
def circ_swing(theta,radius):
    found_pt = [radius,0]

    swing_pt = [0,0]

    t1 = (theta / 2.0)
    g1 = math.radians(90)+t1
    gamma = math.radians(180)-g1

    h = 2 * radius * math.cos(gamma)
    x = h * math.sin(t1)
    y = h * math.cos(t1)

    swing_pt[0] = found_pt[0]+x
    swing_pt[1] = found_pt[1]-y

    return swing_pt