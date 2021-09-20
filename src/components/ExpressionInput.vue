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
      @keydown.down="arrowEvent('down')"
      @keydown.up="arrowEvent('up')"
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
        v-if="showAssistant"
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
        <!--currentFunction fill assistant-->
        <div
          class="w-full p-4 overflow-y-auto bg-blue-50 border-b"
          :class="{
            'h-1/3': splitHeight,
            'h-full': !splitHeight,
          }"
          v-if="assistant.currentFunction !== null"
        >
          <div class="text-lg font-semibold">
            {{ assistant.currentFunction.name }}
          </div>
          <pre
            class="my-2 text-gray-900"
            v-html="getFunctionString(assistant.currentFunction)"
          ></pre>
          <div class="mb-2">{{ assistant.currentFunction.description }}</div>
          <div
            v-for="(arg, index) in assistant.currentFunction.args"
            :key="'arg' + index"
            class="mb-2"
          >
            <em>@param </em>
            <span
              :class="{ 'font-semibold': !arg.current, bold: arg.current }"
              >{{ arg.name }}</span
            >{{ arg.optional ? " (optional)" : "" }} -
            {{ arg.description }}
          </div>
        </div>

        <!--Suggestions assistant: Functions-->
        <div
          v-if="assistant.requiredDataType !== 'signalid'"
          class="grid grid-cols-5"
          :class="{
            'h-2/3': splitHeight,
            'h-full': !splitHeight,
          }"
        >
          <div class="col-span-1 h-full overflow-y-auto bg-white">
            <div
              v-for="(suggestion, index) in assistant.suggestions"
              :key="suggestion.key"
              :ref="'suggested-item-' + index"
              class="px-4 py-1.5 cursor-default"
              @mouseover="selected = index"
              @click="suggestionSelected"
              :class="{
                'bg-blue-100': index === selected,
              }"
            >
              {{ suggestion.name }}
            </div>
          </div>

          <!--Documentation-->
          <div
            class="col-span-4 h-full p-4 overflow-y-auto text-sm bg-gray-100"
            v-if="selectedSuggestion !== null"
          >
            <div class="text-lg font-semibold">
              {{ selectedSuggestion.name }}
            </div>
            <pre
              class="my-2 text-gray-900"
              v-html="getFunctionString(selectedSuggestion)"
            ></pre>
            <div class="mb-2">
              {{ selectedSuggestion.description }}
            </div>
            <div
              v-for="(arg, index) in selectedSuggestion.args"
              :key="'arg' + index"
              class="mb-2"
            >
              <em>@param</em> <span class="font-semibold">{{ arg.name }}</span
              >{{ arg.optional ? " (optional)" : "" }} -
              {{ arg.description }}
            </div>
          </div>
        </div>

        <!--Suggestions assistant: Signals-->
        <div
          v-if="assistant.requiredDataType === 'signalid'"
          class="overflow-y-auto"
          :class="{
            'h-2/3': splitHeight,
            'h-full': !splitHeight,
          }"
        >
          <div
            v-for="(signal, index) in assistant.suggestions"
            :key="signal.id"
            :ref="'suggested-signal-' + index"
            class="bg-white px-4 py-1.5 cursor-default grid grid-cols-5"
            @mouseover="selected = index"
            @click="suggestionSelected"
            :class="{
              'bg-blue-100': index === selected,
            }"
          >
            <div class="col-span-2 overflow-ellipsis">{{ signal.id }}</div>
            <div class="col-span-1 overflow-ellipsis">{{ signal.type }}</div>
            <div class="col-span-1 overflow-ellipsis">
              {{ signal.unitName }}
            </div>
            <div class="col-span-1 overflow-ellipsis">
              {{ signal.unitSymbol }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { assistant } from "../modules/assistant";

export default {
  name: "ExpressionInput",

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
    selectedSuggestion() {
      return this.assistant.suggestions === null
        ? null
        : this.assistant.suggestions[this.selected];
    },

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
  },

  methods: {
    arrowEvent(type) {
      if (type === "down")
        this.selected =
          this.selected == this.assistant.suggestions.length - 1
            ? this.selected
            : this.selected + 1;
      else this.selected = this.selected == 0 ? 0 : this.selected - 1;
      this.$refs["suggested-item-" + this.selected].scrollIntoView();
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
      console.log("inserted", inserted);
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
