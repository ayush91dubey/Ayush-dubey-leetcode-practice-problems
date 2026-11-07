class Solution {
    public int[] assignTasks(int[] servers, int[] tasks) {

        int n = tasks.length;
        int[] ans = new int[n];

        PriorityQueue<int[]> available = new PriorityQueue<>(
            (a, b) -> {
                if (a[0] != b[0]) {
                    return a[0] - b[0]; // weight
                }
                return a[1] - b[1];     // index
            }
        );

        PriorityQueue<long[]> busy = new PriorityQueue<>(
            (a, b) -> {
                if (a[0] != b[0]) {
                    return Long.compare(a[0], b[0]); // free time
                }
                if (a[1] != b[1]) {
                    return Long.compare(a[1], b[1]); // weight
                }
                return Long.compare(a[2], b[2]);     // index
            }
        );

        for (int i = 0; i < servers.length; i++) {
            available.offer(new int[]{servers[i], i});
        }

        long time = 0;

        for (int i = 0; i < n; i++) {

            time = Math.max(time, i);

            while (!busy.isEmpty() && busy.peek()[0] <= time) {
                long[] s = busy.poll();
                available.offer(new int[]{
                    (int) s[1],
                    (int) s[2]
                });
            }

            if (available.isEmpty()) {

                time = busy.peek()[0];

                while (!busy.isEmpty() && busy.peek()[0] <= time) {
                    long[] s = busy.poll();
                    available.offer(new int[]{
                        (int) s[1],
                        (int) s[2]
                    });
                }
            }

            int[] server = available.poll();

            ans[i] = server[1];

            busy.offer(new long[]{
                time + tasks[i], // next free time
                server[0],       // weight
                server[1]        // index
            });
        }

        return ans;
    }
}