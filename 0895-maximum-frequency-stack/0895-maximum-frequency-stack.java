import java.util.*;

class FreqStack {

    private HashMap<Integer, Integer> freq;
    private HashMap<Integer, Stack<Integer>> group;
    private int maxFreq;

    public FreqStack() {
        freq = new HashMap<>();
        group = new HashMap<>();
        maxFreq = 0;
    }

    public void push(int val) {

        int f = freq.getOrDefault(val, 0) + 1;
        freq.put(val, f);

        maxFreq = Math.max(maxFreq, f);

        group.putIfAbsent(f, new Stack<>());
        group.get(f).push(val);
    }

    public int pop() {

        int val = group.get(maxFreq).pop();

        freq.put(val, freq.get(val) - 1);

        if (group.get(maxFreq).isEmpty()) {
            maxFreq--;
        }

        return val;
    }
}