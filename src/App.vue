<template>
  <div class="p-5 h-screen mx-auto max-w-4xl">
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
    <div>LHS: {{ lhs }}</div>

    <!--TESTING-->
    <input
      type="button"
      class="
        fixed
        right-4
        bottom-4
        px-4
        py-2
        border border-gray-400
        rounded-md
        hover:bg-gray-200
        active:bg-gray-300
        cursor-pointer
      "
      value="Test"
      @click="test"
    />
  </div>
</template>

<script>
import ExpressionInput from "./components/ExpressionInput.vue";
import { parse } from "mathjs";
import { suggestor } from "./modules/suggestor";

export default {
  name: "App",
  components: {
    ExpressionInput,
  },
  data() {
    return {
      expression: "", //'(s("sig_2")+s("sig_1", 1000))/2',
      expressionObj: {},
      errorMsg: null,
      suggestions: null,
      lhs: null,
    };
  },

  created() {
    //this.analyzeExpression(this.expression);
    //this.makeSuggestions();
  },

  methods: {
    test() {
      console.log(suggestor.test(".slice()", 7));
    },

    userInput(expr, cursorStart, cursorEnd, triggerType) {
      let newInput = triggerType === "input";

      //detect input change
      if (newInput) this.analyzeExpression();

      //make suggestions
      this.makeSuggestions(cursorStart, cursorEnd, newInput);
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

    makeSuggestions(cursorStart = 0, cursorEnd = 0, newInput = false) {
      this.suggestions = suggestor.update(
        this.expression,
        cursorStart,
        cursorEnd,
        newInput
      );
    },

    focusout() {
      this.suggestions = null;
    },
  },
};
</script>
