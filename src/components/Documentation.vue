<template>
  <div>
    <pre class="mb-2 text-gray-900" v-show="showFunctionString">{{
      functionString
    }}</pre>

    <div class="text-lg font-semibold mb-2">
      {{ fct.name }}
    </div>

    <div class="mb-2">
      {{ fct.description }}
    </div>
    <div v-for="(arg, index) in fct.args" :key="'arg' + index" class="mb-2">
      <em>@param</em> <span class="font-semibold">{{ arg.name }}</span
      >{{ arg.optional ? " (optional)" : "" }} -
      {{ arg.description }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fct: {
      default: {},
    },
    showFunctionString: {
      default: true,
    },
  },

  computed: {
    functionString() {
      if (this.fct === null) return null;
      let arr = [];
      this.fct.args.forEach((arg, index) => {
        let argString = arg.name + (arg.optional ? "?" : "") + ": " + arg.type;
        arr.push(argString);
      });
      return (
        this.fct.suggestionType +
        " " +
        this.fct.key +
        "(" +
        arr.join(", ") +
        "): " +
        this.fct.returns.type
      );
    },
  },
};
</script>