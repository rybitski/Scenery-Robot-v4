import numpy as np

from scipy import interpolate


import matplotlib.pyplot as plt


#x = np.arange(0, 2*np.pi+np.pi/4, 2*np.pi/8)

#y = np.sin(x)


data =[[ 0.18, 0.11 ], [ 0.24, 0.17 ],

  [ 0.32, 0.24 ], [ 0.37, 0.30 ],

  [ 0.43, 0.43 ], [ 0.49, 0.54 ],

  [ 0.54, 0.60 ], [ 0.60, 0.67 ],

  [ 0.70, 0.78 ], [ 0.76, 0.83 ],

  [ 0.90, 0.97 ], [ 0.98, 1.01 ],

  [ 1.06, 1.08 ], [ 1.12, 1.13 ],

  [ 1.22, 1.17 ], [ 1.30, 1.17 ],

  [ 1.38, 1.14 ], [ 1.46, 1.09 ],

  [ 1.55, 1.01 ], [ 1.60, 0.93 ],

  [ 1.67, 0.84 ], [ 1.72, 0.72 ],

  [ 1.74, 0.64 ], [ 1.74, 0.52 ],

  [ 1.75, 0.39], [2, .5],

  [2.1 , .6], [1.72, .8]]


for i, w in enumerate(data):
        data[i][0] = float(data[i][0]) 
        data[i][1] = float(data[i][1]) 

ctr = np.array(data)


x=ctr[:,0]
y=ctr[:,1]

print(x)
print(y)

#x=np.append(x,x[0])

#y=np.append(y,y[0])


tck,u = interpolate.splprep([x,y],k=3,s=0)

u=np.linspace(0,1,num=50,endpoint=True)

out = interpolate.splev(u,tck)

print(out)

plt.figure()

plt.plot(x, y, 'ro', out[0], out[1], 'b')

plt.legend(['Points', 'Interpolated B-spline', 'True'],loc='best')

plt.axis([min(x)-1, max(x)+1, min(y)-1, max(y)+1])

plt.title('B-Spline interpolation')

plt.show()