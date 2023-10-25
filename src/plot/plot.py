import numpy as np
from pylab import savefig
import matplotlib.pyplot as plt

#benchmarks = [[13.9811,40.9597,82.031,134.575,201.42,282.673,406.700,571.914,825.581],[15.492,46.51,92.9659,154.934,232.255,325.626,433.466,557.783,697.43],[16.919,50.862,101.617,169.481,254.165,355.725,475.357,611.952,763.087],[18.999,56.9,114.109,190.072,285.551,398.666,531.8469,683.2895,855.682],[20.525,61.44,122.894,204.4369,306.9533,429.858,573.98,736.859,920.645],[22.3925,67.2541,134.658,224.304,337.2432,472.0855,628.0161,808.29259,1009.662],[24.0566,72.060,143.982,240.041,360.577,504.171,673.226,864.6937,1081.8144]]

benchmarks = [
    [9.294, 28.3, 58.108, 95.148, 139.349, 194.695, 272.857, 357.764],
    [10.546, 31.992, 62.894, 104.844, 159.174, 220.385, 294.378, 437.50],
    [12.167, 36.471, 72.942, 121.544, 182.354, 255.687, 340.341, 472.689],
    [21.596, 64.0, 126.30199999999999, 210.267, 318.8, 441.347, 589.581, 876.598],
    [24.842, 73.681, 146.796, 244.20499999999998, 365.435, 512.229, 681.2, 945.745],
    [26.724999999999998, 78.66699999999997, 156.10299999999995, 260.207, 389.03200000000004, 548.058, 727.685, 981.974]
]

benchmarks_16_bit_3parties_min = [9.08, 27.13, 44.79, 81.20, 116.85, 171.14, 224.84, 296.90, 801.70, 1363.404, 2835.064, 4605.78]
benchmarks_16_bit_3parties_avg = [9.12, 31.484, 48.4, 84.01, 120.0, 174.0, 228.0, 299.04, 839.27, 1497.994, 3305.487, 5564.66]
benchmarks_16_bit_3parties_max = [9.13, 35.991, 54.0, 89.991, 126.0, 180.0, 234.0, 305.99, 899.88, 1737.91, 4078.227, 6917.56]

benchmarks_16_bit_3parties_avg_quick = [9.02, 30.978, 47.5, 86.7, 127.7, 176.7, 232.656, 300.9, 1003.25, 1648.01, 2543.0, 4006.17]


benchmarks_16bit_3parties_x = [2, 3, 4,5,6,7,8,9,15,20,25,30]
benchmarks_16bit_3parties_y = [10.546, 31.992, 62.894, 104.844, 159.174, 220.385, 294.378, 437.50, 1115.922, 2025.598, 3219.745, 4831.16]

benchmarks_16_bits_3parties_expanded = [15145.35]

benchmarks_voters = [130.45,135.18,133.98,129.8,136.1,133.3,132.9,131.1,131.5,133.6,133.7,129.7,130.3,135.5,134.1,135.25,133.45,134.28, 132.9]

benchmarks_voters_x = [100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000]
benchmarks_voters_y = [87.8985105213,87.5203288863,87.7263639820,87.4210518585,87.8757592027,87.5203288863,87.9565463717,87.8757592027,87.2389397445,87.4098932527]

benchmarks_network = [[9.43, 29.14, 58.891999999999996, 97.944, 142.98499999999999, 196.471, 279.833, 367.004], 
    [10.857999999999999, 32.748, 64.502, 106.044, 162.208, 225.656, 301.578, 444.14]]

def plot():
    mins = []
    for x in benchmarks:
        tmp = []
        for val in x:
            tmp.append(val/60.0)
        mins.append(tmp)

    t = [i for i in range(len(mins))]
    cand = [i for i in range(2,len(mins[0])+2)]

    ax = plt.subplot(111)

    for i in t:
        log.debug(i)
        f_i = mins[i]
        log.debug(cand)
        log.debug(f_i)
        ax.plot(cand, f_i, label=str(i+2) + " trustees")

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')

    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width * 0.8, box.height])

    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("test.pdf")

def plot_network():
    mins = []
    for x in benchmarks_network:
        tmp = []
        for val in x:
            tmp.append(val/60.0)
        mins.append(tmp)

    t = [i for i in range(0, len(mins))]
    cand = [i for i in range(2,len(mins[0])+2)]

    ax = plt.subplot(111)

    for i in t:
        log.debug(i)
        f_i = mins[i]
        log.debug(cand)
        log.debug(f_i)
        ax.plot(cand, f_i, label=str(i+2) + " trustees")

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')

    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width * 0.8, box.height])

    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("test-network.pdf")

def plot_16_bit_3parties():
    mins = []
    for x in benchmarks_16bit_3parties_y:
        mins.append(x/60.0)

    ax = plt.subplot(111)

    ax.plot(benchmarks_16bit_3parties_x, mins, label=str(3) + " trustees")

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')

    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width * 0.8, box.height])

    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("test-16.pdf")

def plot_voters():
    mins = []
    for x in benchmarks_voters_y:
        mins.append((x)/60.0)

    ax = plt.subplot(111)

    ax.plot(benchmarks_voters_x, mins, 'o')

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# voters')
    plt.ylabel('time [min]')

    plt.axis([None, None, 1.3, 1.6])


    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width, box.height * 0.5])

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("benchmarks-voters.pdf", bbox_inches='tight')

def plot_result():
    with open("result.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content] 
    benchmarks = {}
    for i in content:
        s = i.split(",")

        t = int(s[0][3:])
        c = int(s[1][4:])
        b = float(s[2][7:]) / 60.0

        if not t in benchmarks:
            benchmarks[t] = []
        benchmarks[t].append((c, b))


    ax = plt.subplot(111)
    for i in benchmarks:
        x = []
        y = []
        for value in benchmarks[i]:
            x.append(value[0])
            y.append(value[1])
        ax.plot(x, y, '-o', label=str(i) + " trustees")

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')

    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width * 0.8, box.height])

    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("pool.pdf")

def plot_results_voters():
    with open("result-voters.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content] 
    benchmarks = {}
    for i in content:
        s = i.split(",")

        t = int(s[0][3:])
        c = int(s[2][4:])
        b = float(s[3][7:]) / 60.0

        if not c in benchmarks:
            benchmarks[c] = []
        benchmarks[c].append((t, b))

    plt.figure(figsize=(0.5,1))

    ax = plt.subplot(111)
    for i in benchmarks:
        x = []
        y = []
        for value in benchmarks[i]:
            x.append(value[0])
            y.append(value[1])
        log.debug(x)
        log.debug(y)
        log.debug("...")
        ax.plot(x, y, 'o')

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')
    plt.axis([None, None, 1.2, 1.7])

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("pool-voters.pdf")

def plot_result_internet():
    benchmarks = {0 : [], 1 : [], 2 : [], 3 : [], 4 : [], 5 : []}

    with open("result-local-network.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content] 
    for i in content:
        s = i.split(",")

        t = int(s[0][3:])
        c = int(s[1][4:])
        b = float(s[2][7:]) / 60.0

        if t == 3:
            benchmarks[0].append((c, b))

    with open("result-internet-1.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content] 
    for i in content:
        s = i.split(",")

        t = int(s[0][3:])
        c = int(s[1][4:])
        b = float(s[2][7:]) / 60.0

        if t == 3:
            benchmarks[1].append((c, b))

    with open("result-internet-2.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content] 
    for i in content:
        s = i.split(",")

        t = int(s[0][3:])
        c = int(s[1][4:])
        b = float(s[2][7:]) / 60.0

        if t == 3:
            benchmarks[2].append((c, b))

    p = [2,3,4,5,6,7,8,9,15,20,30,40]
    for i in range(len(p)):
        benchmarks[3].append((p[i], benchmarks_16_bit_3parties_min[i] / 60.0))
        benchmarks[4].append((p[i], benchmarks_16_bit_3parties_avg[i] / 60.0))
        benchmarks[5].append((p[i], benchmarks_16_bit_3parties_max[i] / 60.0))


    ax = plt.subplot(111)
    for i in range(len(benchmarks)):
        x = []
        y = []
        for value in benchmarks[i]:
            x.append(value[0])
            y.append(value[1])
        if i == 0:
            ax.plot(x, y, '-x', label="local network\n2-8 trustees/\nsingle machine\n3 trustees")
        elif i == 1:
            ax.plot(x, y, '-^', label="internet 1\n3 trustees")
        elif i == 2:
            ax.plot(x, y, '-s', label="internet 2\n3 trustees")
        #elif i == 3:
        #    ax.plot(x, y, '-o', label="internet 1\n3 trustees\ninsertion sort\nminimum")
        elif i == 4:
            ax.plot(x, y, '-P', label="internet 1\n3 trustees\ninsertion sort\naverage")
        #elif i == 5:
        #    ax.plot(x, y, '-*', label="internet 1\n3 trustees\ninsertion sort\nmaximum")

    plt.title('Runtime')
    ax.grid(True)
    plt.xlabel('# candidates')
    plt.ylabel('time [min]')

    # Shrink current axis by 20%
    box = ax.get_position()
    ax.set_position([box.x0, box.y0, box.width * 0.76, box.height])

    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    # red dashes, blue squares and green triangles
    #plt.plot(t, t, 'r--', t, t**2, 'bs', t, t**3, 'g^')
    #plt.show()
    plt.savefig("internet.pdf")

if __name__ == "__main__":
    #plot()
    #plot_network()
    #plot_16_bit_3parties()
    #plot_voters()
    #plot_result()
    plot_result_internet()