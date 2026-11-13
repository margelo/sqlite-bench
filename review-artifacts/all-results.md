**locked-d7c513c, android, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 9812.02 | 9785.15 | 9872.75 |
| expo-sqlite | select + read props | 3 | 49207.54 | 48373.42 | 49353.52 |
| expo-sqlite | sync insert | 3 | 6516.43 | 6313.08 | 6572.10 |
| expo-sqlite | tx insert | 3 | 3536.43 | 3480.81 | 3620.06 |
| nitro-sqlite | async insert | 3 | 7930.60 | 7820.62 | 8042.78 |
| nitro-sqlite | select + read props | 3 | 30745.92 | 29498.02 | 31785.70 |
| nitro-sqlite | sync insert | 3 | 5892.51 | 5877.64 | 6140.77 |
| nitro-sqlite | tx insert | 3 | 1118.92 | 1106.14 | 1137.62 |
| op-sqlite | async insert | 3 | 6861.67 | 6401.88 | 7639.46 |
| op-sqlite | select + read props | 3 | 4555.31 | 4536.38 | 4624.84 |
| op-sqlite | sync insert | 3 | 5871.16 | 5706.06 | 6316.53 |
| op-sqlite | tx insert | 3 | 960.56 | 901.64 | 993.05 |
| op-sqlite (HostObjects) | select + read props | 3 | 9248.41 | 8969.53 | 9423.02 |

**locked-d7c513c, ios, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 352.87 | 341.62 | 374.26 |
| expo-sqlite | select + read props | 3 | 2096.01 | 2075.16 | 2099.78 |
| expo-sqlite | sync insert | 3 | 281.89 | 268.46 | 298.45 |
| expo-sqlite | tx insert | 3 | 104.89 | 103.93 | 112.69 |
| nitro-sqlite | async insert | 3 | 300.49 | 276.36 | 318.75 |
| nitro-sqlite | select + read props | 3 | 1252.88 | 1249.38 | 1270.32 |
| nitro-sqlite | sync insert | 3 | 282.94 | 262.74 | 310.72 |
| nitro-sqlite | tx insert | 3 | 35.17 | 21.40 | 36.97 |
| op-sqlite | async insert | 3 | 271.86 | 268.05 | 313.52 |
| op-sqlite | select + read props | 3 | 348.05 | 343.05 | 352.69 |
| op-sqlite | sync insert | 3 | 273.96 | 261.82 | 309.25 |
| op-sqlite | tx insert | 3 | 35.11 | 15.84 | 35.78 |
| op-sqlite (HostObjects) | select + read props | 3 | 438.23 | 428.47 | 451.14 |

**nitro-main-45f400c-op-18.2.5, android, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 9806.82 | 9163.61 | 10555.47 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 2781.97 | 2742.10 | 3043.85 |
| expo-sqlite | select-all-250-checksum | 3 | 10673.42 | 10398.88 | 11723.62 |
| expo-sqlite | select-point-1000-checksum | 3 | 4855.26 | 4809.20 | 5116.87 |
| expo-sqlite | tx-async-1000 | 3 | 2868.36 | 2802.40 | 3008.14 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 1173.20 | 1117.41 | 1182.33 |
| expo-sqlite | tx-prepared-sync-1000 | 3 | 125.25 | 123.09 | 131.18 |
| expo-sqlite | tx-sync-1000 | 3 | 197.75 | 196.22 | 206.66 |
| nitro-sqlite | batch-1000 | 3 | 33.75 | 31.96 | 48.40 |
| nitro-sqlite | prepared-all-250-checksum | 3 | 4159.68 | 2797.23 | 4188.51 |
| nitro-sqlite | prepared-point-1000-checksum | 3 | 1091.59 | 1011.96 | 1168.38 |
| nitro-sqlite | select-all-250-checksum | 3 | 4230.43 | 3472.87 | 4290.53 |
| nitro-sqlite | select-point-1000-checksum | 3 | 1238.52 | 660.66 | 1300.24 |
| nitro-sqlite | tx-async-1000 | 3 | 1040.20 | 1035.55 | 1081.43 |
| nitro-sqlite | tx-prepared-async-1000 | 3 | 970.12 | 709.67 | 1019.99 |
| nitro-sqlite | tx-prepared-sync-1000 | 3 | 34.35 | 34.13 | 43.36 |
| nitro-sqlite | tx-sync-1000 | 3 | 39.06 | 35.02 | 46.55 |
| op-sqlite | batch-1000 | 3 | 36.30 | 30.32 | 37.24 |
| op-sqlite | prepared-all-250-checksum | 3 | 3424.98 | 2515.57 | 3445.58 |
| op-sqlite | prepared-point-1000-checksum | 3 | 1072.69 | 640.46 | 1208.77 |
| op-sqlite | select-all-250-checksum | 3 | 1156.83 | 1144.10 | 1203.78 |
| op-sqlite | select-hosts-250-checksum | 3 | 2815.70 | 2608.38 | 2941.75 |
| op-sqlite | select-point-1000-checksum | 3 | 1168.35 | 578.24 | 1241.09 |
| op-sqlite | tx-async-1000 | 3 | 938.90 | 348.99 | 986.41 |
| op-sqlite | tx-prepared-async-1000 | 3 | 1021.68 | 473.36 | 1102.86 |
| op-sqlite | tx-prepared-sync-1000 | 3 | 27.64 | 27.16 | 32.94 |
| op-sqlite | tx-sync-1000 | 3 | 29.09 | 28.07 | 31.40 |

**nitro-main-45f400c-op-18.2.5, android, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 10015.73 | 10014.25 | 10107.07 |
| expo-sqlite | select + read props | 3 | 41032.13 | 40417.83 | 41071.62 |
| expo-sqlite | sync insert | 3 | 6031.24 | 6011.33 | 6615.30 |
| expo-sqlite | tx insert | 3 | 3109.80 | 3090.84 | 3333.60 |
| nitro-sqlite | async insert | 3 | 7951.58 | 7927.75 | 7997.90 |
| nitro-sqlite | select + read props | 3 | 16636.12 | 15875.64 | 16683.14 |
| nitro-sqlite | sync insert | 3 | 5860.68 | 5655.06 | 6022.73 |
| nitro-sqlite | tx insert | 3 | 961.69 | 954.04 | 999.76 |
| op-sqlite | async insert | 3 | 6145.32 | 5949.11 | 6208.14 |
| op-sqlite | select + read props | 3 | 4555.05 | 4532.98 | 4572.50 |
| op-sqlite | sync insert | 3 | 5880.72 | 5506.13 | 5945.04 |
| op-sqlite | tx insert | 3 | 1099.35 | 1076.11 | 1189.75 |
| op-sqlite (HostObjects) | select + read props | 3 | 8893.86 | 8654.98 | 9073.74 |

**nitro-main-45f400c-op-18.2.5, iPhone 13 Pro, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 1043.73 | 1040.24 | 1049.53 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 155.36 | 154.34 | 155.40 |
| expo-sqlite | select-all-250-checksum | 3 | 1062.45 | 1059.25 | 1065.36 |
| expo-sqlite | select-point-1000-checksum | 3 | 224.07 | 223.32 | 225.58 |
| expo-sqlite | tx-async-1000 | 3 | 164.86 | 163.79 | 165.59 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 96.55 | 94.28 | 98.67 |
| expo-sqlite | tx-prepared-sync-1000 | 3 | 63.79 | 62.80 | 64.82 |
| expo-sqlite | tx-sync-1000 | 3 | 89.27 | 88.17 | 89.44 |
| nitro-sqlite | batch-1000 | 3 | 13.47 | 6.86 | 14.33 |
| nitro-sqlite | prepared-all-250-checksum | 3 | 282.92 | 281.84 | 285.49 |
| nitro-sqlite | prepared-point-1000-checksum | 3 | 66.31 | 66.05 | 67.95 |
| nitro-sqlite | select-all-250-checksum | 3 | 282.47 | 281.76 | 283.99 |
| nitro-sqlite | select-point-1000-checksum | 3 | 71.79 | 71.64 | 74.16 |
| nitro-sqlite | tx-async-1000 | 3 | 70.55 | 67.53 | 70.99 |
| nitro-sqlite | tx-prepared-async-1000 | 3 | 63.61 | 62.82 | 64.95 |
| nitro-sqlite | tx-prepared-sync-1000 | 3 | 15.27 | 13.67 | 18.34 |
| nitro-sqlite | tx-sync-1000 | 3 | 22.31 | 21.94 | 23.27 |
| op-sqlite | batch-1000 | 3 | 13.13 | 12.69 | 14.25 |
| op-sqlite | prepared-all-250-checksum | 3 | 249.89 | 249.83 | 250.64 |
| op-sqlite | prepared-point-1000-checksum | 3 | 57.37 | 55.20 | 58.24 |
| op-sqlite | select-all-250-checksum | 3 | 160.23 | 159.43 | 162.57 |
| op-sqlite | select-hosts-250-checksum | 3 | 234.21 | 233.32 | 235.66 |
| op-sqlite | select-point-1000-checksum | 3 | 58.88 | 58.03 | 60.22 |
| op-sqlite | tx-async-1000 | 3 | 54.97 | 54.70 | 55.39 |
| op-sqlite | tx-prepared-async-1000 | 3 | 46.49 | 45.74 | 53.41 |
| op-sqlite | tx-prepared-sync-1000 | 3 | 14.22 | 14.19 | 16.99 |
| op-sqlite | tx-sync-1000 | 3 | 16.67 | 16.33 | 16.70 |

**nitro-main-45f400c-op-18.2.5, iPhone 13 Pro, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 904.89 | 902.05 | 907.04 |
| expo-sqlite | select + read props | 3 | 4129.53 | 4126.88 | 4129.89 |
| expo-sqlite | sync insert | 3 | 829.28 | 828.18 | 830.24 |
| expo-sqlite | tx insert | 3 | 165.81 | 164.47 | 166.87 |
| nitro-sqlite | async insert | 3 | 868.06 | 854.70 | 942.38 |
| nitro-sqlite | select + read props | 3 | 990.54 | 984.35 | 991.68 |
| nitro-sqlite | sync insert | 3 | 884.80 | 883.72 | 914.76 |
| nitro-sqlite | tx insert | 3 | 58.12 | 57.30 | 59.93 |
| op-sqlite | async insert | 3 | 911.19 | 846.99 | 932.65 |
| op-sqlite | select + read props | 3 | 504.69 | 503.31 | 505.35 |
| op-sqlite | sync insert | 3 | 897.27 | 890.79 | 902.95 |
| op-sqlite | tx insert | 3 | 57.68 | 54.56 | 62.97 |
| op-sqlite (HostObjects) | select + read props | 3 | 605.90 | 603.59 | 607.06 |

**nitro-main-45f400c-op-18.2.5, ios, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 342.86 | 335.22 | 353.82 |
| expo-sqlite | select + read props | 3 | 2047.38 | 2045.71 | 2051.95 |
| expo-sqlite | sync insert | 3 | 282.12 | 275.34 | 321.12 |
| expo-sqlite | tx insert | 3 | 86.57 | 81.48 | 106.50 |
| nitro-sqlite | async insert | 3 | 286.06 | 267.39 | 289.27 |
| nitro-sqlite | select + read props | 3 | 681.12 | 672.92 | 693.05 |
| nitro-sqlite | sync insert | 3 | 261.25 | 260.56 | 265.75 |
| nitro-sqlite | tx insert | 3 | 36.51 | 35.86 | 37.42 |
| op-sqlite | async insert | 3 | 287.19 | 276.50 | 288.30 |
| op-sqlite | select + read props | 3 | 342.72 | 334.75 | 351.90 |
| op-sqlite | sync insert | 3 | 282.28 | 271.75 | 288.97 |
| op-sqlite | tx insert | 3 | 36.33 | 35.89 | 38.93 |
| op-sqlite (HostObjects) | select + read props | 3 | 442.65 | 439.70 | 447.56 |

**nitro-main-45f400c-op-18.2.5-modules-0.37.1, android, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 11629.15 | 11520.52 | 11655.95 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 3312.26 | 3304.68 | 3348.50 |
| expo-sqlite | select-all-250-checksum | 3 | 12233.48 | 12112.86 | 12533.66 |
| expo-sqlite | select-point-1000-checksum | 3 | 5422.79 | 5403.79 | 5516.30 |
| expo-sqlite | tx-async-1000 | 3 | 3286.69 | 3204.84 | 3362.04 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 1260.16 | 1156.99 | 1267.94 |
| expo-sqlite | tx-prepared-sync-1000 | 3 | 132.03 | 124.00 | 136.79 |
| expo-sqlite | tx-sync-1000 | 3 | 207.18 | 202.10 | 210.37 |
| nitro-sqlite | batch-1000 | 3 | 50.58 | 47.93 | 52.03 |
| nitro-sqlite | prepared-all-250-checksum | 3 | 4720.20 | 4718.38 | 4726.97 |
| nitro-sqlite | prepared-point-1000-checksum | 3 | 1324.12 | 1304.27 | 1402.45 |
| nitro-sqlite | select-all-250-checksum | 3 | 4776.79 | 4752.13 | 4841.66 |
| nitro-sqlite | select-point-1000-checksum | 3 | 1501.38 | 1481.01 | 1513.27 |
| nitro-sqlite | tx-async-1000 | 3 | 1277.20 | 1147.90 | 1286.93 |
| nitro-sqlite | tx-prepared-async-1000 | 3 | 1031.99 | 931.72 | 1034.01 |
| nitro-sqlite | tx-prepared-sync-1000 | 3 | 35.26 | 35.04 | 38.49 |
| nitro-sqlite | tx-sync-1000 | 3 | 52.82 | 46.44 | 59.71 |
| op-sqlite | batch-1000 | 3 | 42.64 | 42.59 | 49.40 |
| op-sqlite | prepared-all-250-checksum | 3 | 4082.07 | 3999.32 | 4116.42 |
| op-sqlite | prepared-point-1000-checksum | 3 | 1183.92 | 1128.06 | 1255.27 |
| op-sqlite | select-all-250-checksum | 3 | 1448.48 | 1427.21 | 1530.22 |
| op-sqlite | select-hosts-250-checksum | 3 | 3045.57 | 2957.57 | 3143.13 |
| op-sqlite | select-point-1000-checksum | 3 | 1210.65 | 1208.70 | 1280.06 |
| op-sqlite | tx-async-1000 | 3 | 984.62 | 973.53 | 1230.45 |
| op-sqlite | tx-prepared-async-1000 | 3 | 941.61 | 657.62 | 990.44 |
| op-sqlite | tx-prepared-sync-1000 | 3 | 39.13 | 37.18 | 41.87 |
| op-sqlite | tx-sync-1000 | 3 | 35.22 | 33.78 | 39.83 |

**nitro-main-45f400c-op-18.2.5-modules-0.37.1, android, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 10319.54 | 10005.97 | 10512.70 |
| expo-sqlite | select + read props | 3 | 48176.14 | 46899.19 | 48447.50 |
| expo-sqlite | sync insert | 3 | 6398.75 | 6319.67 | 6749.98 |
| expo-sqlite | tx insert | 3 | 3420.98 | 3328.42 | 3522.71 |
| nitro-sqlite | async insert | 3 | 8414.38 | 8381.93 | 8562.71 |
| nitro-sqlite | select + read props | 3 | 18517.11 | 18079.28 | 18869.46 |
| nitro-sqlite | sync insert | 3 | 6812.49 | 6417.05 | 6880.94 |
| nitro-sqlite | tx insert | 3 | 1177.86 | 1171.19 | 1230.50 |
| op-sqlite | async insert | 3 | 6768.42 | 6447.94 | 7457.62 |
| op-sqlite | select + read props | 3 | 4842.70 | 4714.77 | 5624.21 |
| op-sqlite | sync insert | 3 | 5855.30 | 5787.61 | 6328.52 |
| op-sqlite | tx insert | 3 | 1047.11 | 903.77 | 1110.44 |
| op-sqlite (HostObjects) | select + read props | 3 | 9319.56 | 8988.47 | 9468.94 |

**nitro-main-45f400c-op-18.2.5-modules-0.37.1, iPhone 13 Pro, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 1043.05 | 1042.88 | 1044.53 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 153.79 | 152.88 | 154.76 |
| expo-sqlite | select-all-250-checksum | 3 | 1060.11 | 1059.69 | 1062.30 |
| expo-sqlite | select-point-1000-checksum | 3 | 223.62 | 222.91 | 223.71 |
| expo-sqlite | tx-async-1000 | 3 | 162.19 | 161.60 | 162.33 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 95.39 | 94.70 | 96.81 |
| expo-sqlite | tx-prepared-sync-1000 | 3 | 64.16 | 61.44 | 65.42 |
| expo-sqlite | tx-sync-1000 | 3 | 88.73 | 88.61 | 89.20 |
| nitro-sqlite | batch-1000 | 3 | 13.58 | 13.56 | 14.99 |
| nitro-sqlite | prepared-all-250-checksum | 3 | 245.22 | 245.04 | 245.80 |
| nitro-sqlite | prepared-point-1000-checksum | 3 | 67.86 | 65.74 | 69.01 |
| nitro-sqlite | select-all-250-checksum | 3 | 248.19 | 246.00 | 250.97 |
| nitro-sqlite | select-point-1000-checksum | 3 | 71.12 | 70.89 | 75.59 |
| nitro-sqlite | tx-async-1000 | 3 | 67.90 | 65.52 | 68.44 |
| nitro-sqlite | tx-prepared-async-1000 | 3 | 61.47 | 60.64 | 63.10 |
| nitro-sqlite | tx-prepared-sync-1000 | 3 | 14.08 | 13.41 | 17.66 |
| nitro-sqlite | tx-sync-1000 | 3 | 24.36 | 16.42 | 24.77 |
| op-sqlite | batch-1000 | 3 | 14.53 | 13.66 | 14.56 |
| op-sqlite | prepared-all-250-checksum | 3 | 247.84 | 231.62 | 251.62 |
| op-sqlite | prepared-point-1000-checksum | 3 | 57.51 | 56.33 | 57.98 |
| op-sqlite | select-all-250-checksum | 3 | 162.01 | 159.93 | 164.67 |
| op-sqlite | select-hosts-250-checksum | 3 | 233.50 | 233.14 | 233.53 |
| op-sqlite | select-point-1000-checksum | 3 | 56.53 | 55.44 | 59.35 |
| op-sqlite | tx-async-1000 | 3 | 53.71 | 52.54 | 56.18 |
| op-sqlite | tx-prepared-async-1000 | 3 | 47.29 | 44.98 | 47.33 |
| op-sqlite | tx-prepared-sync-1000 | 3 | 14.26 | 14.00 | 17.16 |
| op-sqlite | tx-sync-1000 | 3 | 16.83 | 16.15 | 18.84 |

**nitro-main-45f400c-op-18.2.5-modules-0.37.1, iPhone 13 Pro, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 907.85 | 906.16 | 909.69 |
| expo-sqlite | select + read props | 3 | 4119.56 | 4113.30 | 4120.65 |
| expo-sqlite | sync insert | 3 | 835.01 | 833.54 | 838.25 |
| expo-sqlite | tx insert | 3 | 165.99 | 165.17 | 169.82 |
| nitro-sqlite | async insert | 3 | 876.40 | 839.76 | 893.74 |
| nitro-sqlite | select + read props | 3 | 840.76 | 838.75 | 842.57 |
| nitro-sqlite | sync insert | 3 | 881.84 | 879.11 | 898.40 |
| nitro-sqlite | tx insert | 3 | 57.90 | 57.73 | 61.47 |
| op-sqlite | async insert | 3 | 909.27 | 858.90 | 914.63 |
| op-sqlite | select + read props | 3 | 505.50 | 504.97 | 519.08 |
| op-sqlite | sync insert | 3 | 899.01 | 894.07 | 899.07 |
| op-sqlite | tx insert | 3 | 57.39 | 52.44 | 58.33 |
| op-sqlite (HostObjects) | select + read props | 3 | 606.02 | 605.60 | 606.44 |

**published-9.8.2, android, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 11458.76 | 11351.73 | 11570.62 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 3359.87 | 3354.15 | 3398.16 |
| expo-sqlite | select-all-250-checksum | 3 | 12409.84 | 12168.86 | 12525.71 |
| expo-sqlite | select-point-1000-checksum | 3 | 5518.38 | 5467.13 | 5579.40 |
| expo-sqlite | tx-async-1000 | 3 | 3286.28 | 3175.87 | 3389.33 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 1252.40 | 1228.94 | 1275.26 |
| expo-sqlite | tx-sync-1000 | 3 | 210.12 | 194.29 | 215.20 |
| nitro-sqlite | batch-1000 | 3 | 47.38 | 44.72 | 48.39 |
| nitro-sqlite | select-all-250-checksum | 3 | 5151.03 | 5136.19 | 5172.91 |
| nitro-sqlite | select-point-1000-checksum | 3 | 1452.71 | 1373.81 | 1506.59 |
| nitro-sqlite | tx-async-1000 | 3 | 1302.47 | 1256.66 | 1362.94 |
| nitro-sqlite | tx-sync-1000 | 3 | 54.03 | 42.36 | 58.34 |
| op-sqlite | batch-1000 | 3 | 38.29 | 34.57 | 41.70 |
| op-sqlite | prepared-all-250-checksum | 3 | 4163.70 | 3792.51 | 4313.92 |
| op-sqlite | prepared-point-1000-checksum | 3 | 1247.57 | 1003.92 | 1300.34 |
| op-sqlite | select-all-250-checksum | 3 | 1292.30 | 1228.49 | 1407.03 |
| op-sqlite | select-hosts-250-checksum | 3 | 3067.60 | 3037.77 | 3092.93 |
| op-sqlite | select-point-1000-checksum | 3 | 1290.03 | 1226.65 | 1350.92 |
| op-sqlite | tx-async-1000 | 3 | 1175.44 | 955.18 | 1178.45 |
| op-sqlite | tx-prepared-async-1000 | 3 | 807.75 | 764.82 | 856.36 |
| op-sqlite | tx-sync-1000 | 3 | 33.27 | 30.79 | 42.49 |

**published-9.8.2, android, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 9873.63 | 9794.19 | 10006.15 |
| expo-sqlite | select + read props | 3 | 48197.98 | 46961.92 | 49644.70 |
| expo-sqlite | sync insert | 3 | 6462.66 | 6383.65 | 6579.47 |
| expo-sqlite | tx insert | 3 | 3302.13 | 3290.12 | 3524.51 |
| nitro-sqlite | async insert | 3 | 8087.62 | 8015.65 | 8325.18 |
| nitro-sqlite | select + read props | 3 | 20101.29 | 18835.54 | 20396.21 |
| nitro-sqlite | sync insert | 3 | 5814.28 | 5811.38 | 6613.52 |
| nitro-sqlite | tx insert | 3 | 1121.05 | 1091.72 | 1211.89 |
| op-sqlite | async insert | 3 | 6359.42 | 6224.31 | 7019.45 |
| op-sqlite | select + read props | 3 | 4631.32 | 4446.96 | 4850.85 |
| op-sqlite | sync insert | 3 | 5812.45 | 5786.95 | 5837.15 |
| op-sqlite | tx insert | 3 | 1098.59 | 998.87 | 1109.21 |
| op-sqlite (HostObjects) | select + read props | 3 | 9222.75 | 9185.79 | 9411.03 |

**published-9.8.2, ios, diagnostic.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | prepared-all-250-checksum | 3 | 521.79 | 510.80 | 524.74 |
| expo-sqlite | prepared-point-1000-checksum | 3 | 97.28 | 96.50 | 99.01 |
| expo-sqlite | select-all-250-checksum | 3 | 536.01 | 526.90 | 539.98 |
| expo-sqlite | select-point-1000-checksum | 3 | 139.75 | 139.09 | 140.15 |
| expo-sqlite | tx-async-1000 | 3 | 106.17 | 105.68 | 107.01 |
| expo-sqlite | tx-prepared-async-1000 | 3 | 58.58 | 58.04 | 59.12 |
| expo-sqlite | tx-sync-1000 | 3 | 39.63 | 32.33 | 40.34 |
| nitro-sqlite | batch-1000 | 3 | 5.44 | 5.38 | 5.68 |
| nitro-sqlite | select-all-250-checksum | 3 | 196.11 | 195.28 | 201.33 |
| nitro-sqlite | select-point-1000-checksum | 3 | 45.56 | 39.84 | 45.76 |
| nitro-sqlite | tx-async-1000 | 3 | 40.54 | 40.11 | 41.08 |
| nitro-sqlite | tx-sync-1000 | 3 | 8.14 | 8.01 | 8.15 |
| op-sqlite | batch-1000 | 3 | 5.62 | 5.51 | 5.63 |
| op-sqlite | prepared-all-250-checksum | 3 | 166.83 | 165.16 | 168.64 |
| op-sqlite | prepared-point-1000-checksum | 3 | 34.40 | 21.81 | 34.97 |
| op-sqlite | select-all-250-checksum | 3 | 105.54 | 84.27 | 107.71 |
| op-sqlite | select-hosts-250-checksum | 3 | 158.99 | 155.60 | 162.59 |
| op-sqlite | select-point-1000-checksum | 3 | 37.93 | 37.70 | 39.62 |
| op-sqlite | tx-async-1000 | 3 | 35.21 | 34.00 | 36.32 |
| op-sqlite | tx-prepared-async-1000 | 3 | 27.93 | 27.41 | 28.64 |
| op-sqlite | tx-sync-1000 | 3 | 6.14 | 5.88 | 7.07 |

**published-9.8.2, ios, original.** Elapsed milliseconds; median, minimum, maximum.

| Library | Workload | Samples | Median | Min | Max |
|---|---|---:|---:|---:|---:|
| expo-sqlite | async insert | 3 | 363.96 | 333.91 | 420.92 |
| expo-sqlite | select + read props | 3 | 2096.62 | 2090.42 | 2167.39 |
| expo-sqlite | sync insert | 3 | 306.86 | 275.12 | 622.06 |
| expo-sqlite | tx insert | 3 | 106.74 | 105.90 | 110.23 |
| nitro-sqlite | async insert | 3 | 306.36 | 278.16 | 357.52 |
| nitro-sqlite | select + read props | 3 | 745.78 | 742.13 | 759.60 |
| nitro-sqlite | sync insert | 3 | 260.15 | 258.70 | 310.34 |
| nitro-sqlite | tx insert | 3 | 34.61 | 23.83 | 36.35 |
| op-sqlite | async insert | 3 | 287.69 | 267.21 | 315.10 |
| op-sqlite | select + read props | 3 | 352.80 | 350.20 | 357.78 |
| op-sqlite | sync insert | 3 | 277.57 | 263.67 | 281.60 |
| op-sqlite | tx insert | 3 | 37.90 | 35.14 | 37.97 |
| op-sqlite (HostObjects) | select + read props | 3 | 437.39 | 424.94 | 443.51 |
