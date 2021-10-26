import configparser
import math
import numpy as np
import matplotlib.pyplot as plt

def midpoints(waypoints):
    total_waypoints = []
    for i in range(len(waypoints) -1):
        dist = math.sqrt((waypoints[i+1][0]-waypoints[i][0])**2 + (waypoints[i+1][1]-waypoints[i][1])**2)
        j = 0
        while j < dist:
            total_waypoints.append(tuple(a+j/dist*(b-a) for a,b in zip(waypoints[i], waypoints[i+1])))
            j += 3.0
    total_waypoints.append(waypoints[-1])
    return total_waypoints

def smooth(path, weight_data, weight_smooth, tolerance):
    newPath = [[w[0], w[1]] for w in path]
    change = tolerance
    while(change >= tolerance):
        change = 0.0
        for i in range(1, len(path) - 1):
            for j in range(0, len(path[i])):
                aux = newPath[i][j]
                newPath[i][j] += weight_data * (path[i][j] - newPath[i][j]) + weight_smooth * (newPath[i-1][j] + newPath[i+1][j] - (2.0 * newPath[i][j]))
                change += abs((aux - newPath[i][j]))
    return newPath	

path = [[0.0, 0.0], [-12.0, 6.0], [24.0, -6.0], [36.0, 0.0]]
final_path = midpoints(path)
weight_smooth = 0.8
weight_data = 0.2
tolerance = 0.001

data = np.array(smooth(final_path, weight_data, weight_smooth, tolerance))
x, y = data.T
plt.scatter(x, y)
plt.show()

#print(smooth(final_path, weight_data, weight_smooth, tolerance))