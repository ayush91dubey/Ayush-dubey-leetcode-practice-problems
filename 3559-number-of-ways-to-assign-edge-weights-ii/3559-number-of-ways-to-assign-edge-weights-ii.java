import java.util.*;

class Solution {

    static final int MOD = 1_000_000_007;
    static final int LOG = 17 + 1; // 2^17 > 1e5

    int[][] up;
    int[] depth;
    List<Integer>[] graph;

    public int[] assignEdgeWeights(int[][] edges, int[][] queries) {

        int n = edges.length + 1;

        graph = new ArrayList[n + 1];
        for (int i = 0; i <= n; i++) {
            graph[i] = new ArrayList<>();
        }

        for (int[] e : edges) {
            int u = e[0];
            int v = e[1];

            graph[u].add(v);
            graph[v].add(u);
        }

        up = new int[LOG][n + 1];
        depth = new int[n + 1];

        dfs(1, 0);

        for (int k = 1; k < LOG; k++) {
            for (int node = 1; node <= n; node++) {
                up[k][node] = up[k - 1][up[k - 1][node]];
            }
        }

        int[] ans = new int[queries.length];

        for (int i = 0; i < queries.length; i++) {

            int u = queries[i][0];
            int v = queries[i][1];

            if (u == v) {
                ans[i] = 0;
                continue;
            }

            int lca = getLCA(u, v);

            int d = depth[u] + depth[v] - 2 * depth[lca];

            ans[i] = (int) modPow(2, d - 1);
        }

        return ans;
    }

    private void dfs(int node, int parent) {

        up[0][node] = parent;

        for (int nei : graph[node]) {

            if (nei == parent) {
                continue;
            }

            depth[nei] = depth[node] + 1;

            dfs(nei, node);
        }
    }

    private int getLCA(int u, int v) {

        if (depth[u] < depth[v]) {
            int temp = u;
            u = v;
            v = temp;
        }

        int diff = depth[u] - depth[v];

        for (int k = 0; k < LOG; k++) {
            if (((diff >> k) & 1) == 1) {
                u = up[k][u];
            }
        }

        if (u == v) {
            return u;
        }

        for (int k = LOG - 1; k >= 0; k--) {

            if (up[k][u] != up[k][v]) {
                u = up[k][u];
                v = up[k][v];
            }
        }

        return up[0][u];
    }

    private long modPow(long base, long exp) {

        long ans = 1;

        while (exp > 0) {

            if ((exp & 1) == 1) {
                ans = (ans * base) % MOD;
            }

            base = (base * base) % MOD;
            exp >>= 1;
        }

        return ans;
    }
}