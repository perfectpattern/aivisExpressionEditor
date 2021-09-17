<template>
  <div class="relative inline-block text-left mb-12">
    <div
      v-if="suggestions !== null"
      class="fixed left-0 top-0 h-full w-full z-10"
      @click="$emit('focusout')"
    ></div>
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
        'rounded-b-md': suggestions === null,
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
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <!--Container-->
      <div
        v-if="suggestions !== null"
        class="
          origin-top-right
          absolute
          top-10
          left-0
          z-10
          mt-0
          h-56
          w-full
          rounded-b-md
          shadow-lg
          bg-white
          ring-1 ring-black ring-opacity-5
          divide-y divide-gray-100
          focus:outline-none
          overflow-hidden
          flex
        "
      >
        <!--Selection-->
        <div
          class="
            w-56
            h-full
            overflow-y-auto
            bg-white
            ring-1 ring-black ring-opacity-5
            divide-y divide-gray-100
            focus:outline-none
          "
        >
          <div
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.key"
            :ref="'suggested-item-' + index"
            class="px-4 py-2 cursor-default"
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
        <div class="w-full h-full p-4 overflow-y-auto text-sm">
          <div class="text-lg font-semibold">
            {{ suggestions[selected].name }}
          </div>
          <pre class="my-2 text-gray-900">{{ functionString }}</pre>
          <div class="mb-2">{{ suggestions[selected].description }}</div>
          <div
            v-for="(arg, index) in suggestions[selected].args"
            :key="'arg' + index"
            class="mb-2"
          >
            <em>@param</em> <span class="font-semibold">{{ arg.name }}</span
            >{{ arg.optional ? " (optional)" : "" }} -
            {{ arg.description }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { suggestor } from "../modules/suggestor";

export default {
  name: "ExpressionInput",

  props: {
    modelValue: String,
    suggestions: {
      type: Object,
      default: null,
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
    functionString() {
      //returns like "function parseInt(string: string, radix?: number): number"

      //get selected suggestion
      let sug = this.suggestions[this.selected];

      //create string
      let arr = [];
      sug.args.forEach((arg) => {
        arr.push(arg.name + (arg.optional ? "?" : "") + ": " + arg.type);
      });
      return (
        sug.type +
        " " +
        sug.key +
        "(" +
        arr.join(", ") +
        "): " +
        sug.returns.type
      );
    },
  },

  methods: {
    arrowEvent(type) {
      if (type === "down")
        this.selected =
          this.selected == this.suggestions.length - 1
            ? this.selected
            : this.selected + 1;
      else this.selected = this.selected == 0 ? 0 : this.selected - 1;
      this.$refs["suggested-item-" + this.selected].scrollIntoView();
    },

    down() {
      console.log("down");
    },

    suggestionSelected() {
      let suggestion = this.suggestions[this.selected];

      //insert suggestion into expression
      let inserted = suggestor.insert(this.modelValue, suggestion, this.cursor);

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
