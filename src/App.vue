<template>
  <div class="p-5 h-screen mx-auto max-w-4xl">
    <div class="text-blue-400 font-bold mb-2">aivis Formula Editor</div>
    <expression-input
      class="mb-2 w-full"
      v-model="expression"
      :currentFunction="currentFunction"
      :suggestions="suggestions"
      @update:modelValue="userInput"
      @focusout="resetAssistant"
    ></expression-input>

    <div class="text-red-400 mb-2">{{ errorMsgs.join("|") }}</div>
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
      >{{ JSON.stringify(datatypeResponse, null, "\t") }}</pre
    >
  </div>
</template>

<script>
import ExpressionInput from "./components/ExpressionInput.vue";
import { parse } from "mathjs";
import { assistant } from "./modules/assistant";
import { validator } from "./modules/validator";

export default {
  name: "App",
  components: {
    ExpressionInput,
  },
  data() {
    return {
      expression: "", //"(2).abs(4)", // '(2/((1+s("sig_1", 1000))/2))', //
      node: {},
      datatypeResponse: {},
      errorMsgs: [],
      currentFunction: null,
      suggestions: null,
    };
  },

  created() {
    this.analyzeExpression(this.expression);
    this.updateAssistant();
  },

  methods: {
    //this method is called after any user input
    userInput(expr, cursorStart, cursorEnd, triggerType) {
      this.resetAssistant();
      this.resetErrors();

      //react to input change
      this.analyzeExpression();

      //make suggestions
      this.updateAssistant(cursorStart, cursorEnd, triggerType === "input");
    },

    analyzeExpression() {
      try {
        this.node = parse(this.expression);
        this.datatypeResponse = validator.evaluate(this.node); //evaluate datatype
        if (this.datatypeResponse.error)
          this.errorMsgs.push(this.datatypeResponse.errorMsg);
      } catch (e) {
        this.errorMsgs.push(JSON.stringify(e.message));
        this.node = {};
        this.datatypeResponse = {};
      }
    },

    updateAssistant(cursorStart = 0, cursorEnd = 0, newInput = false) {
      let assistantResult = assistant.update(
        this.expression,
        cursorStart,
        cursorEnd,
        newInput
      );

      console.log(assistantResult.successMsg);
      //console.log(assistantResult);

      //Error
      if (assistantResult.error) {
        this.errorMsgs.push(assistantResult.errorMsg);
        this.resetAssistant();
      }

      //Success
      else {
        this.currentFunction = assistantResult.currentFunction;
        this.suggestions = assistantResult.suggestions;
      }
    },

    resetAssistant() {
      this.currentFunction = null;
      this.suggestions = null;
    },

    resetErrors() {
      this.errorMsgs = [];
    },
  },
};
</script>
