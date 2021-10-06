<template>
  <div v-if="func !== null">
    <pre class="mb-2 text-gray-900" v-show="showFunctionString">{{
      functionString
    }}</pre>

    <div class="text-lg font-semibold mb-2">
      {{ func.spec.name }}
    </div>

    <div class="mb-2">
      {{ func.spec.description }}
    </div>
    <div
      v-for="(arg, index) in func.spec.args"
      :key="'arg' + index"
      class="mb-2"
    >
      <em>@param</em> <span class="font-semibold">{{ arg.name }}</span
      >{{ arg.optional ? " (optional)" : "" }} -
      {{ arg.description }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    func: {
      default: null,
    },
    showFunctionString: {
      default: true,
    },
  },

  computed: {
    functionString() {
      if (this.func === null) return null;
      let arr = [];
      this.func.spec.args.forEach((arg, index) => {
        let argString = arg.name + (arg.optional ? "?" : "") + ": " + arg.type;
        arr.push(argString);
      });
      return (
        this.func.type +
        " " +
        this.func.spec.key +
        "(" +
        arr.join(", ") +
        "): " +
        this.func.spec.returns.type
      );
    },
  },
};
</script>