<template>
  <q-page
    class="tw-flex tw-my-4 tw-justify-center tw-px-4 xl:tw-max-w-8xl xl:tw-mx-auto"
  >
    <div class="tw-w-full">
      <div class="tw-mb-4">
        <div class="tw-mb-4 tw-text-center">
          <q-file
            v-model="uploadedFile"
            ref="file"
            accept=".html, .htm"
            style="display: none"
            @rejected="onRejected"
            @update:model-value="parseFile"
          />
          <button
            @click="triggerFileUpload"
            label="Upload MT4/MT5 File"
            class="tw-flex tw-justify-center tw-transition-all hover:tw-opacity-80 tw-ease-linear tw-border-none tw-bg-primary tw-text-white tw-px-3 tw-py-2 tw-rounded-sm"
          >
            <q-icon size="xs" name="fal fa-file-circle-plus" class="tw-mr-2" />
            <span>Upload File</span>
          </button>
          <div
            class="tw-border-l-4 tw-border-indigo-400 tw-bg-indigo-50 tw-p-4 tw-mt-4"
          >
            <div class="tw-flex">
              <div class="tw-flex-shrink-0">
                <ExclamationTriangleIcon
                  class="tw-h-5 tw-w-5 tw-text-indigo-400"
                  aria-hidden="true"
                />
              </div>
              <div class="tw-ml-3">
                <p class="tw-text-sm tw-text-indigo-700">
                  MT5 must be <b>.html</b> format - MT4 must be <b>.htm</b>
                  format
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <q-table
            :rows="summaryRows"
            :columns="summaryColumns"
            row-key="name"
            flat
            class="tw-border"
            hide-bottom
            :row-class="rowClass"
          >
            <template v-slot:body-cell-value="props">
              <q-td
                :props="props"
                :class="
                  props.row.name === 'Total Profit'
                    ? 'tw-text-positive'
                    : props.row.name === 'Total Profit Removed'
                    ? 'tw-text-negative'
                    : ''
                "
                class="tw-text-sm"
              >
                {{ props.row.value }}
              </q-td>
            </template>
          </q-table>
          <div class="tw-flex tw-flex-col tw-border tw-mt-4 tw-gap-2 tw-w-full">
            <div class="tw-flex tw-items-center tw-w-full tw-px-4 tw-gap-4">
              <div class="tw-text-sm tw-w-full">
                Daily/Single Trade {{ customPercent }}% Rule:
              </div>
              <div class="tw-justify-center custom-input tw-flex tw-w-full">
                <q-btn
                  flat
                  round
                  dense
                  icon="remove"
                  @click="decrementCustomPercent"
                />
                <q-input
                  v-model="customPercent"
                  type="number"
                  dense
                  input-class="custom-input-field tw-text-center"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  @click="incrementCustomPercent"
                />
              </div>
              <div class="tw-w-full tw-text-right">
                ${{ formatNumber(totalProfitPercentage) }}
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-w-full tw-px-4 tw-gap-4">
              <div class="tw-text-sm tw-w-full">
                Withdrawal After Profit Split:
              </div>
              <div class="custom-input tw-justify-center tw-flex tw-w-full">
                <q-btn
                  flat
                  round
                  dense
                  icon="remove"
                  @click="decrementProfitSplit"
                />
                <q-input
                  v-model="profitSplit"
                  type="number"
                  dense
                  input-class="custom-input-field tw-text-center"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  @click="incrementProfitSplit"
                />
              </div>
              <div class="tw-w-full tw-text-right">
                ${{ formatNumber(withdrawalAfterSplit) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tw-mb-4 tw-border">
        <q-card-section>
          <div class="tw-mb-4 tw-gap-2 tw-flex tw-items-center tw-w-full">
            <q-icon size="xs" name="fal fa-calendar" />
            <div class="tw-text-base">
              Daily Profits Exceeding {{ customPercent }}% of Total Profit
            </div>
          </div>
          <q-table
            v-if="filteredDailyProfits && filteredDailyProfits.length > 0"
            :rows="filteredDailyProfits"
            :columns="columns"
            row-key="date"
            flat
            hide-bottom
          >
            <template v-slot:body-cell-date="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.exceeds ? 'negative' : 'positive'"
                  align="middle"
                >
                  {{ formatDate(props.row.date) }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-profit="props">
              <q-td :props="props">
                ${{ formatNumber(props.row.profit) }}
              </q-td>
            </template>
          </q-table>
          <div v-else class="tw-text-center tw-text-gray-500 tw-my-4">
            No violations found.
          </div>
        </q-card-section>
      </div>

      <div class="tw-mb-4 tw-border">
        <q-card-section>
          <div class="tw-mb-4 tw-gap-2 tw-flex tw-items-center tw-w-full">
            <q-icon size="xs" name="fal fa-exclamation-triangle" />
            <div class="tw-text-base">
              Single Trades Exceeding {{ customPercent }}% of Total Profit
            </div>
          </div>
          <q-table
            v-if="singleTradeViolations && singleTradeViolations.length > 0"
            :rows="singleTradeViolations"
            :columns="tradeColumns"
            row-key="tradeId"
            flat
          >
            <template v-slot:body-cell-date="props">
              <q-td :props="props">
                <q-badge color="negative" align="middle">
                  {{ formatDate(props.row.entryDate) }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-symbol="props">
              <q-td :props="props">
                {{ props.row.symbol }}
              </q-td>
            </template>
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                {{ props.row.type }}
              </q-td>
            </template>
            <template v-slot:body-cell-volume="props">
              <q-td :props="props">
                {{ props.row.volume }}
              </q-td>
            </template>
            <template v-slot:body-cell-profit="props">
              <q-td :props="props">
                ${{ formatNumber(props.row.profit) }}
              </q-td>
            </template>
            <template v-slot:body-cell-commission="props">
              <q-td :props="props">
                ${{ formatNumber(props.row.commission) }}
              </q-td>
            </template>
            <template v-slot:body-cell-swap="props">
              <q-td :props="props"> ${{ formatNumber(props.row.swap) }} </q-td>
            </template>
          </q-table>
          <div v-else class="tw-text-center tw-text-gray-500 tw-my-4">
            No violations found.
          </div>
        </q-card-section>
      </div>

      <div class="tw-border">
        <q-card-section>
          <div class="tw-mb-4 tw-flex tw-items-center tw-w-full tw-gap-2">
            <q-icon size="xs" name="fal fa-bell-exclamation" />
            <div class="tw-text-base">
              Individual Trade Violations (Profit Removed:
              <span class="tw-text-negative">
                ${{ formatNumber(profitRemoved) }}</span
              >)
            </div>
          </div>
          <q-table
            v-if="violations && violations.length > 0"
            :rows="violations"
            :columns="violationColumns"
            row-key="tradeId"
            flat
            class="violations-table"
          >
            <template v-slot:body-cell-tradeId="props">
              <q-td :props="props">
                {{ props.row.tradeId }}
              </q-td>
            </template>
            <template v-slot:body-cell-entryDate="props">
              <q-td :props="props">
                {{ formatDate(props.row.entryDate) }}
              </q-td>
            </template>
            <template v-slot:body-cell-symbol="props">
              <q-td :props="props">
                {{ props.row.symbol }}
              </q-td>
            </template>
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                {{ props.row.type }}
              </q-td>
            </template>
            <template v-slot:body-cell-volume="props">
              <q-td :props="props">
                {{ props.row.volume }}
              </q-td>
            </template>
            <template v-slot:body-cell-profit="props">
              <q-td :props="props">
                ${{ formatNumber(props.row.profit) }}
              </q-td>
            </template>
            <template v-slot:body-cell-commission="props">
              <q-td :props="props">
                ${{ formatNumber(props.row.commission) }}
              </q-td>
            </template>
            <template v-slot:body-cell-swap="props">
              <q-td :props="props"> ${{ formatNumber(props.row.swap) }} </q-td>
            </template>
          </q-table>
          <div v-else class="tw-text-center tw-text-gray-500 tw-my-4">
            No violations found.
          </div>
        </q-card-section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";

const violations = ref([]);
const filteredResults = ref([]);
const numTrades = ref(0);
const totalProfit = ref(0);
const profitSplit = ref(60); // Default to 100%
const customPercent = ref(25); // Default to 25%
const uploadedFile = ref(null);

const averageLotSize = computed(() => {
  const totalLots = filteredResults.value.reduce((acc, trade) => {
    return acc + parseFloat(trade.volume || 0); // Ensure volume is parsed as a float, defaulting to 0 if undefined
  }, 0);
  return totalLots / filteredResults.value.length || 0; // Handle division by zero if length is 0
});

const maxLot = computed(() => averageLotSize.value * 2);
const minLot = computed(() => averageLotSize.value * 0.25);

const totalProfitPercentage = computed(
  () => totalProfit.value * (customPercent.value / 100)
);

const dailyProfits = computed(() => {
  const profitMap = {};

  filteredResults.value.forEach((trade) => {
    // Check if trade.exitDate is valid before proceeding
    if (trade.exitDate) {
      const date = new Date(trade.exitDate).toISOString().split("T")[0];
      if (date !== "Invalid Date") {
        profitMap[date] = (profitMap[date] || 0) + parseFloat(trade.profit);
      }
    }
  });

  return Object.keys(profitMap).map((date) => {
    const profit = profitMap[date];
    return {
      date,
      profit,
      exceeds: profit > totalProfitPercentage.value,
    };
  });
});

const filteredDailyProfits = computed(() => {
  return dailyProfits.value.filter((day) => day.exceeds);
});

const columns = [
  {
    name: "date",
    required: true,
    label: "Date",
    align: "left",
    field: (row) => row.date,
  },
  {
    name: "profit",
    align: "right",
    label: "Profit",
    field: (row) => row.profit,
  },
];

const tradeColumns = [
  {
    name: "date",
    required: true,
    label: "Date",
    align: "left",
    field: (row) => row.entryDate,
  },
  {
    name: "symbol",
    label: "Symbol",
    align: "left",
    field: (row) => row.symbol,
  },
  { name: "type", label: "Type", align: "left", field: (row) => row.type },
  {
    name: "volume",
    align: "right",
    label: "Volume",
    field: (row) => row.volume,
  },
  {
    name: "profit",
    align: "right",
    label: "Profit",
    field: (row) => row.profit,
  },
  {
    name: "commission",
    align: "right",
    label: "Commission",
    field: (row) => row.commission,
  },
  { name: "swap", align: "right", label: "Swap", field: (row) => row.swap },
];

const violationColumns = [
  {
    name: "tradeId",
    required: true,
    label: "Trade ID",
    align: "left",
    field: (row) => row.tradeId,
  },
  {
    name: "entryDate",
    label: "Entry Date",
    align: "left",
    field: (row) => row.entryDate,
  },
  {
    name: "symbol",
    label: "Symbol",
    align: "left",
    field: (row) => row.symbol,
  },
  { name: "type", label: "Type", align: "left", field: (row) => row.type },
  {
    name: "volume",
    label: "Volume",
    align: "right",
    field: (row) => row.volume,
  },
  {
    name: "profit",
    align: "right",
    label: "Profit",
    field: (row) => row.profit,
  },
  {
    name: "commission",
    align: "right",
    label: "Commission",
    field: (row) => row.commission,
  },
  { name: "swap", align: "right", label: "Swap", field: (row) => row.swap },
];

const summaryColumns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left",
    field: (row) => row.name,
  },
  {
    name: "value",
    align: "right",
    label: "Value",
    field: (row) => row.value,
  },
];

const rowClass = (row) => {
  return row.rowIndex % 2 === 0 ? "bg-gray-100" : "";
};

const errorToast = (message) => {
  console.error(message);
};

const buildTradeList = () => {
  const totalLots = filteredResults.value.reduce(
    (acc, trade) => acc + parseFloat(trade.volume || 0),
    0
  );
  const avgLotSize = totalLots / filteredResults.value.length || 0;

  totalProfit.value = filteredResults.value.reduce(
    (acc, trade) =>
      acc +
      parseFloat(trade.profit || 0) +
      parseFloat(trade.commission || 0) +
      parseFloat(trade.swap || 0),
    0
  );

  const maxLotSize = avgLotSize * 2;
  const minLotSize = avgLotSize * 0.25;

  violations.value = filteredResults.value.filter((trade) => {
    const volume = parseFloat(trade.volume || 0);
    return volume < minLotSize || volume > maxLotSize;
  });
};

const summaryRows = computed(() => [
  { name: "Average Lot Size", value: formatNumber(averageLotSize.value) },
  {
    name: "Trade Range",
    value: `${formatNumber(minLot.value)} - ${formatNumber(maxLot.value)}`,
  },
  { name: "Total Profit", value: `$${formatNumber(totalProfit.value)}` },
  {
    name: "Total Profit Removed",
    value: `$${formatNumber(profitRemoved.value)}`,
  },
]);

const formatNumber = (number) => {
  return parseFloat(number).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const profitRemoved = computed(() => {
  return violations.value.reduce(
    (acc, trade) =>
      acc +
      parseFloat(trade.profit) +
      parseFloat(trade.commission) +
      parseFloat(trade.swap),
    0
  );
});

const withdrawalAfterRemovedProfit = computed(() => {
  return totalProfit.value - profitRemoved.value;
});

const withdrawalAfterSplit = computed(() => {
  return withdrawalAfterRemovedProfit.value * (profitSplit.value / 100);
});

const singleTradeViolations = computed(() => {
  return filteredResults.value.filter(
    (trade) => parseFloat(trade.profit) > totalProfitPercentage.value
  );
});

const formatDate = (date) => {
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return date; // Return the original date in case of error
  }
};

const parseMt5 = (file) => {
  const worker = new Worker("/workers/mt5.js");

  worker.onmessage = (e) => {
    if (e.data.error) {
      errorToast(e.data.error);
      return;
    }

    filteredResults.value = e.data.trades;
    numTrades.value = e.data.trades.length;
    console.log("mt5 upload", filteredResults);
    buildTradeList();
  };

  worker.postMessage(file);
};

const parseMt4 = (file) => {
  const worker = new Worker("/workers/mt4.js");

  worker.onmessage = (e) => {
    if (e.data.error) {
      errorToast(e.data.error);
      return;
    }

    if (!e.data.trades) {
      errorToast("No trades found in the provided file.");
      return;
    }

    filteredResults.value = e.data.trades;
    numTrades.value = e.data.trades.length;
    console.log("mt4 upload", filteredResults);
    buildTradeList();
  };

  worker.onerror = (error) => {
    errorToast(`Worker error: ${error.message}`);
  };

  worker.postMessage(file);
};

const parseFile = (file) => {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "html") {
    parseMt5(file);
  } else if (extension === "htm") {
    parseMt4(file);
  } else {
    errorToast("Unsupported file format. Please upload a .html or .htm file.");
  }
};

const triggerFileUpload = () => {
  document.querySelector("input[type=file]").click();
};

const onRejected = () => {
  errorToast("File type not accepted. Please upload a .html or .htm file.");
};

const decrementProfitSplit = () => {
  if (profitSplit.value > 0) profitSplit.value--;
};

const incrementProfitSplit = () => {
  profitSplit.value++;
};

const decrementCustomPercent = () => {
  if (customPercent.value > 0) customPercent.value--;
};

const incrementCustomPercent = () => {
  customPercent.value++;
};
</script>

<style scoped>
.violations-table >>> tr {
  height: auto;
}
.violations-table >>> tr:nth-child(even) {
  background-color: #f9fafb;
}

.no-arrows::-webkit-outer-spin-button,
.no-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-arrows {
  -moz-appearance: textfield;
}

.custom-input {
  display: flex;
  align-items: center;
}

.custom-input-field {
  text-align: center;
  padding: 0;
  border: none;
  width: 3em;
}
</style>
