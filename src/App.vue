<template>
  <div class="p-5 h-screen mx-auto max-w-2xl">
    <div class="text-blue-400 font-bold mb-2">aivis Formula Editor</div>
    <expression-input
      class="mb-2 w-full"
      v-model="expression"
      :suggestions="suggestions"
      @update:modelValue="userInput"
      @focusout="focusout"
    ></expression-input>
    <div class="text-red-400 mb-2">{{ errorMsg }}</div>
    <pre
      class="
        mb-2
        bg-white
        p-4
        border border-gray-200
        rounded-md
        text-sm text-gray-600
        max-h-96
        overflow-y-auto
      "
      >{{ JSON.stringify(expressionObj, null, "\t") }}</pre
    >
  </div>
</template>

<script>
import ExpressionInput from "./components/ExpressionInput.vue";
import { parse } from "mathjs";

export default {
  name: "App",
  components: {
    ExpressionInput,
  },
  data() {
    return {
      expression: "(1+1)*sig_1",
      expressionObj: {},
      errorMsg: null,
      suggestions: null,
    };
  },

  created() {
    this.analyzeExpression(this.expression);
  },

  methods: {
    userInput(value, cursorStart, cursorEnd, triggerType) {
      console.log(cursorStart, cursorEnd, triggerType);

      //detect input change
      if (triggerType === "input") {
        this.analyzeExpression();
      }

      //make suggestions
      this.makeSuggestions(cursorStart, cursorEnd);
    },

    analyzeExpression() {
      try {
        this.expressionObj = parse(this.expression);
        this.errorMsg = null;
      } catch (e) {
        this.errorMsg = JSON.stringify(e.message);
        this.expressionObj = {};
      }
    },

    makeSuggestions(cursorStart, cursorEnd) {
      if (cursorStart !== cursorEnd) return; //no suggestions for selections
      let lastCharacter =
        cursorStart >= 1
          ? this.expression.substring(cursorStart - 1, cursorStart)
          : null;
      console.log(lastCharacter);
      this.suggestions = { test: "test" };
    },

    focusout() {
      this.suggestions = null;
    },
  },
};
</script>
