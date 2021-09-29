<template>
  <div class="relative inline-block text-left mb-12">
    <!--Blocking layer-->
    <div
      v-show="showAssistant"
      class="fixed left-0 top-0 h-full w-full z-10 bg-black bg-opacity-50"
      @click="$emit('focusout')"
    ></div>

    <!--Expression Input-->
    <input
      class="
        z-20
        absolute
        py-2
        px-2
        w-full
        border border-gray-200
        focus:outline-none
        focus:ring-0
        focus:border-blue-200
        rounded-t-md
      "
      :class="{
        'rounded-b-md': !showAssistant,
      }"
      :ref="'expressionInput'"
      :value="modelValue"
      @keyup="emit($event, 'keyup')"
      @input="emit($event, 'input')"
      @click="emit($event, 'click')"
      @keydown.tab="$emit('focusout')"
      @keydown.down="arrowEvent($event, 'down')"
      @keydown.up="arrowEvent($event, 'up')"
      @keydown.enter="suggestionSelected"
    />
    <div class="text-gray-400 text-xs font-semibold absolute right-1 -top-6">
      Cursor position: {{ cursor }}
    </div>

    <!--Assistant-->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <!--Assistant Container-->
      <div
        v-if="mode !== 'hidden'"
        class="
          absolute
          top-10
          left-0
          z-10
          mt-0
          h-72
          w-full
          rounded-b-md
          shadow-lg
          bg-white
          overflow-hidden
        "
      >
        <!--current function String-->
        <div
          class="
            w-full
            p-4
            overflow-y-auto
            bg-blue-50
            border-b border-gray-300
            h-1/5
          "
          v-if="mode === 'documentation' || mode === 'argSuggestions'"
        >
          <pre
            class="text-gray-900"
            v-html="getFunctionString(assistant.currentFunction)"
          ></pre>
        </div>

        <!--Documentation and suggestions-->
        <div
          :class="{
            'h-4/5': mode === 'documentation' || mode === 'argSuggestions',
            'h-full': mode === 'suggestions',
          }"
        >
          <!--Documentation-->
          <documentation
          class="p-4"
            :fct="assistant.currentFunction"
            :showFunctionString="false"
            v-if="mode === 'documentation'"
          />

          <!--Suggestions-->
          <suggestions
            v-if="mode === 'suggestions' || mode === 'argSuggestions'"
            :suggestions="assistant.suggestions"
            :type="
              assistant.requiredDataType === 'signalid'
                ? 'signals'
                : 'functions'
            "
            v-model:selected="selected"
            @selected="suggestionSelected"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { assistant } from "../modules/assistant";
import Documentation from "./Documentation.vue";
import Suggestions from "./Suggestions.vue";

export default {
  name: "ExpressionInput",

  components: {
    Documentation,
    Suggestions,
  },

  props: {
    modelValue: String,
    assistant: {
      type: Object,
      default: {
        currentFunction: null,
        suggestions: null,
      },
    },
  },

  emits: ["update:modelValue", "focusout"],

  data() {
    return {
      blockNextKeyUp: false,
      cursor: 0,
      selected: 0,
    };
  },

  computed: {
    showAssistant() {
      return (
        this.assistant.suggestions !== null ||
        this.assistant.currentFunction !== null
      );
    },

    splitHeight() {
      return (
        this.assistant.suggestions !== null &&
        this.assistant.currentFunction !== null
      );
    },

    mode() {
      //can be hidden, suggestions, documentation, argSuggestions
      let s = this.assistant.suggestions;
      let f = this.assistant.currentFunction;
      if (s === null && f === null) return "hidden";
      else if (s !== null && f === null) return "suggestions";
      else if (s === null && f !== null) return "documentation";
      else return "argSuggestions";
    },
  },

  methods: {
    arrowEvent(event, type) {
      if (this.assistant.suggestions === null) return;

      //down arrow
      if (type === "down") {
        event.preventDefault();
        this.selected =
          this.selected == this.assistant.suggestions.length - 1
            ? this.selected
            : this.selected + 1;
      }

      //up arrow
      if (type === "up") {
        event.preventDefault();
        this.selected = this.selected == 0 ? 0 : this.selected - 1;
      }
    },

    down() {
      console.log("down");
    },

    getFunctionString(fct) {
      //returns like "function parseInt(string: string, radix?: number): number"
      let activeArgument = fct.hasOwnProperty("currentArgument")
        ? fct.currentArgument
        : -1;
      let boldFunction =
        fct.hasOwnProperty("currentArgument") && activeArgument == -1;

      //create string
      let arr = [];
      fct.args.forEach((arg, index) => {
        let argString = arg.name + (arg.optional ? "?" : "") + ": " + arg.type;
        arr.push(
          index == activeArgument ? "<b>" + argString + "</b>" : argString
        );
      });
      return (
        (boldFunction ? "<b>" : "") +
        fct.suggestionType +
        " " +
        fct.key +
        (boldFunction ? "</b>" : "") +
        "(" +
        arr.join(", ") +
        "): " +
        fct.returns.type
      );
    },

    suggestionSelected() {
      let suggestion = this.assistant.suggestions[this.selected];

      //insert suggestion into expression
      let inserted = assistant.insert(this.modelValue, suggestion, this.cursor);

      //Set cursor
      this.cursor = inserted.cursor;
      setTimeout(
        //no idea, why this delay is needed, but it works.
        function () {
          this.$refs["expressionInput"].setSelectionRange(
            this.cursor,
            this.cursor
          );
          this.$refs["expressionInput"].focus();
        }.bind(this),
        10
      );

      //emit
      this.$emit(
        "update:modelValue",
        inserted.expression,
        this.cursor,
        this.cursor,
        "input"
      );
    },

    emit($event, trigger) {
      //catch keyup trigger
      if (trigger === "keyup" && this.blockNextKeyUp) {
        this.blockNextKeyUp = false;
        return;
      }

      //block next keyup trigger
      if (trigger === "input") {
        this.blockNextKeyUp = true;
      }

      //detect cursor
      this.cursor = $event.target.selectionEnd;

      this.$emit(
        "update:modelValue",
        $event.target.value,
        $event.target.selectionStart,
        $event.target.selectionEnd,
        trigger
      );
    },
  },
};
</script>
