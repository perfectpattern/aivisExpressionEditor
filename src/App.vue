<template>
  <div class="p-5 h-screen mx-auto max-w-4xl">
    <div class="text-blue-400 font-bold mb-2">aivis Formula Editor</div>
    <expression-input
      class="mb-2 w-full"
      v-model="expression"
      :assistant="assistant"
      @update:modelValue="userInput"
      @focusout="resetAssistant"
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
      >{{ JSON.stringify(node, null, "\t") }}</pre
    >
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
      >{{ JSON.stringify(evaluated, null, "\t") }}</pre
    >
  </div>
</template>

<script>
import ExpressionInput from "./components/ExpressionInput.vue";
import { parse } from "mathjs";
import { assistant } from "./modules/assistant";
import { expressionHelpers } from "./modules/expressionHelpers";

export default {
  name: "App",
  components: {
    ExpressionInput,
  },
  data() {
    return {
      expression: '(2/((1+s("sig_1", 1000))/2))',
      node: {},
      evaluated: {},
      errorMsg: null,
      assistant: {
        currentFunction: null,
        suggestions: null,
      },
    };
  },

  created() {
    this.analyzeExpression(this.expression);
    //this.updateAssistant();
  },

  methods: {
    userInput(expr, cursorStart, cursorEnd, triggerType) {
      this.resetAssistant();
      let newInput = triggerType === "input";

      //detect input change
      if (newInput) this.analyzeExpression();

      //make suggestions
      //this.updateAssistant(cursorStart, cursorEnd, newInput);
    },

    analyzeExpression() {
      try {
        this.node = parse(this.expression);
        this.evaluated = expressionHelpers.evaluate(this.node); //evaluate datatype
        this.errorMsg = null;
      } catch (e) {
        this.errorMsg = JSON.stringify(e.message);
        this.node = {};
        this.evaluated = {};
      }
    },

    updateAssistant(cursorStart = 0, cursorEnd = 0, newInput = false) {
      this.assistant = assistant.update(
        this.expression,
        cursorStart,
        cursorEnd,
        newInput
      );
    },

    resetAssistant() {
      this.assistant = {
        currentFunction: null,
        suggestions: null,
      };
    },
  },
};
</script>
