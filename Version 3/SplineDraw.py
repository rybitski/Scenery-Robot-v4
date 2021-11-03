
import numpy as np

from scipy import interpolate


import matplotlib.pyplot as plt

import sys, json
#x = np.arange(0, 2*np.pi+np.pi/4, 2*np.pi/8)

#y = np.sin(x)
data = json.loads(sys.argv[1])
for i, w in enumerate(data):
        data[i][0] = float(data[i][0]) 
        data[i][1] = float(data[i][1]) 

ctr = np.array(data)


x=ctr[:,0]
y=ctr[:,1]


#x=np.append(x,x[0])

#y=np.append(y,y[0])


tck,u = interpolate.splprep([x,y],k=3,s=0)

u=np.linspace(0,1,num=50,endpoint=True)

out = interpolate.splev(u,tck)

for i in range(len(out)):
        for j in range(len(out[i])):
                out[i][j] = round(out[i][j], 2)
                print(out[i][j])

plt.figure()
plt.plot(x, y, 'ro', out[0], out[1], 'b')
plt.legend(['Points', 'Interpolated B-spline', 'True'],loc='best')
plt.axis([min(x)-1, max(x)+1, min(y)-1, max(y)+1])
plt.title('B-Spline interpolation')
plt.show()
#region
#endregion



