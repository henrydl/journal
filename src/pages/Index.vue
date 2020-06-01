<template>
  <q-page class="q-pa-lg col q-gutter-md">
    <div class="right-now-line" :style='rightNowLineStyle'></div>
    <q-card class='timeline t1'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </q-card>
    <q-card class='timeline t2'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </q-card>
    <q-card id='currentBanner' v-if='currentActivity !== null' class='q-pa-md current-activity' :class='"bg-" + currentActivity.category.color + " text-" + currentActivity.category.color'>
      <q-img class='float-right q-mr-md' :style="cardImageStyle" :src='require(`../assets/astronauts/${currentActivity.category.name.toLowerCase()}.png`)' />
      <q-card-section>
        <q-icon size='xl' class='q-mb-md' :name='currentActivity.category.icon' />
        <h4>{{ currentActivity.category.name }}</h4>
        <div class='text-subtitle1'>You've been doing this since {{ this.activeSince }}.</div>
      </q-card-section>
      <q-card-section>
        <p class='text-body1'>{{ messageForYou }}</p>
      </q-card-section>
    </q-card>
    <h5 v-if='currentActivity' class='text-center'>Switch to:</h5>
    <q-card v-else class='q-pa-xl'>
      <h3 class='q-mb-lg'>Your log is empty.</h3>
      <div class='text-subtitle1'>Let's start by picking the activity you're doing right now.</div>
    </q-card>
    <q-card class='q-pa-sm'>
      <q-btn 
        v-for='category in Categories'
        :key="category.name"
        :category='category'
        class='q-ma-sm category-btn' 
        :color='category.name.toLowerCase()' 
        :text-color='category.name.toLowerCase()'
        :icon='catMode ? "" : category.icon'
        :label='category.name'
        size='lg'
        padding='md lg'
        @click='(ev) => chooseCategory(category, ev)'
        >
        <!-- <q-img v-if='catMode' :src='require(`../assets/cats/${currentActivity.category.name.toLowerCase()}.png`)' style='width: 25px; height: 25px' /> -->
        <q-tooltip :delay='800' content-style="font-size: 16px">{{ category.description }}</q-tooltip>
      </q-btn>
    </q-card>
    <!-- <q-btn :color='catMode ? "grey" : "pink"' style='margin-left: 45%' @click='() => { catMode = !catMode }'>Cat Mode</q-btn> -->
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';

import { Activity, Category, Categories } from '../models/activities';
import { putActivity, getScheduleUpToNow, getCurrentActivity} from '../persistence/journal';

export default Vue.extend({
  name: 'TrackerPage',
  components: {  },
  mounted() {
    window.addEventListener('resize', this.matchHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.matchHeight);
  },
  created() {
    const messageCycleInMS = 10000;
    setInterval(this.randomQuote, messageCycleInMS);
    setInterval(this.updateTime, 100);
  },
  data() : { currentActivity: Activity | null, Categories: any, messageForYou: string, activeSince: string, rightNowLineStyle: any, cardImageStyle: any, catMode: boolean} {
    return {
      currentActivity: null,
      Categories,
      messageForYou: "",
      activeSince: "",
      rightNowLineStyle: {
        '--position': 0.58
      },
      cardImageStyle: { 
        'width': '100px',
        'height': '100px'
      },
      catMode: false
    };
  },
  computed: { },
  methods: {
    chooseCategory(category: Category, event: MouseEvent) {
      getCurrentActivity();
      putActivity("exercise");
      getCurrentActivity();
      this.currentActivity = new Activity(category);
      this.randomQuote();
    },
    randomQuote() {
      if (this.currentActivity) {
        const quotes = this.currentActivity.category.quotes;
        const index = Math.floor(rand(0, quotes.length));
        this.messageForYou = quotes[index];
        setTimeout(() => this.matchHeight(), 10);
      }
    },
    updateTime() {
      if (!this.currentActivity) return;
      const sTime = moment(this.currentActivity.startTime);
      this.activeSince = sTime.format('HH:mm') + ', ' + moment.duration(sTime.diff(moment())).humanize(true, { s: 5 });
    },
    matchHeight() {
      const cardEl = document.getElementById('currentBanner');
      if (cardEl) {
        var heightString = (cardEl.clientHeight - 40) + 'px';
        Vue.set(this.cardImageStyle, 'height', heightString); 
        Vue.set(this.cardImageStyle, 'width', heightString); 
        console.log('Height matched.');
      } else {
        console.log('No ref defined.');
        console.log(this.$refs);
      }
    }
  },
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
</script>

<style lang="scss">
  .current-activity {
    box-shadow: 0 0 100px 0 rgba(15, 15, 15, 0.5) inset;
  }

  .category-btn {
    box-shadow: 0 0 10px 0 rgba(15, 15, 15, 0.4) inset;
  }

  .right-now-line {
    --position: 0.0;
    position: absolute;
    width: 5px;
    top: 19px;
    height: 115px;
    background-color: #ffffffe3;
    box-shadow: 0 2px 5px #00000033;
    z-index: 1;
    left: calc((16px + 8px) + ((100% - 70px) * var(--position)));
  }

  .timeline {
    display: flex;
    flex: row;

    &.t1 {
      div {
        height: 50px;
        width: auto;
        border-right: 2px solid black;
      }

      div:nth-child(1) {
        background: $sleep;
        width: 30%;
      }
      div:nth-child(2) {
        background: $leisure;
        width: 1.5%;
      }
      div:nth-child(3) {
        background: $exercise;
        width: 3%;
      }
      div:nth-child(4) {
        background: $eating;
        width: 2%;
      }
      div:nth-child(5) {
        background: $productivity;
        width: 15%;
      }
      div:nth-child(6) {
        background: $eating;
        width: 2%;
      }
      div:nth-child(7) {
        background: $productivity;
        width: 15%;
      }
      div:nth-child(8) {
        background: $exercise;
        width: 3%;
      }
      div:nth-child(9) {
        background: $eating;
        width: 4%;
      }
      div:nth-child(10) {
        background: $social;
        width: 5%;
      }
      div:nth-child(11) {
        background: $leisure;
        width: 13%;
      }
      div:nth-child(12) {
        background: $sleep;
        width: 8%;
      }
    }

    &.t2 {
      margin-top: 5px;

      div {
        height: 50px;
        width: auto;
        border-right: 2px solid black;
      }

      div:nth-child(1) {
        background: $sleep;
        width: 20%;
      }
      div:nth-child(2) {
        background: $leisure;
        width: 40%;
      }
      div:nth-child(3) {
        background: $productivity;
        width: 30%;
      }
      div:nth-child(4) {
        background: $eating;
        width: 4%;
      }
      div:nth-child(5) {
        background: $exercise;
        width: 1%;
      }
      div:nth-child(6) {
        background: $sleep;
        width: 10%;
      }
    }
  }
</style>