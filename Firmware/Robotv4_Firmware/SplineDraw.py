import numpy as np
from scipy import interpolate

import matplotlib.pyplot as plt

#x = np.arange(0, 2*np.pi+np.pi/4, 2*np.pi/8)
#y = np.sin(x)

ctr = np.array( [[0, 0], [5, -5], [10,0], [15, 5], [20, 0], [15, -5], [10, 0], [5,5], [0,0]])

x=ctr[:,0]
y=ctr[:,1]

#x=np.append(x,x[0])
#y=np.append(y,y[0])

tck,u = interpolate.splprep([x,y],k=3,s=0)
u=np.linspace(0,1,num=50,endpoint=True)
out = interpolate.splev(u,tck)

print(out)

path = []

for i in range(len(out[0])):
    path.append([out[0][i], out[1][i]])

plt.figure()
plt.plot(x, y, 'ro', out[0], out[1], 'b')
plt.legend(['Points', 'Interpolated B-spline', 'True'],loc='best')
plt.axis([min(x)-1, max(x)+1, min(y)-1, max(y)+1])
plt.title('B-Spline interpolation')
plt.show()