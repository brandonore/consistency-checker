const parseMt5 = (file) => {
  const convertToISO = (date) => {
    try {
      let d = new Date(date.replace(/(\d{4})\.(\d{2})\.(\d{2})/, "$1-$2-$3"));
      return d.toISOString();
    } catch (error) {
      throw new Error(
        `Error converting date: ${date} to ISO format: ${error.message}`
      );
    }
  };

  try {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;

        const rows = data
          .split("</tr>")
          .slice(0, -1)
          .map((row) => row + "</tr>");
        const startIdx = rows.findIndex((row) =>
          row.includes('bgcolor="#E5F0FC"')
        );
        const endIdx = rows.findIndex((row, idx) => {
          if (idx <= startIdx) return false;
          return row.includes('<td nowrap style="height: 10px"></td>');
        });

        const trades = rows.slice(startIdx, endIdx);
        trades.shift();

        const additionalTrades = rows.slice(endIdx).filter((row) => {
          return row.includes("balance") || row.includes("credit");
        });

        const allTrades = trades.concat(additionalTrades);

        const extractCellValue = (cell, ...replaceValues) => {
          let result = cell.replace(/<\/?[^>]+(>|$)/g, "").trim();
          replaceValues.push("nowrap>"); // Add 'nowrap>' to the list of replace values
          replaceValues.forEach((value) => {
            result = result.replace(value, "");
          });
          result = result.startsWith(">") ? result.slice(1) : result;
          return result;
        };

        const extractTrade = (trade) => {
          const cells = trade.split("<td");

          return {
            entryDate: convertToISO(extractCellValue(cells[1])),
            tradeId: extractCellValue(cells[2]),
            symbol: extractCellValue(cells[3]),
            type: extractCellValue(cells[4]),
            volume: extractCellValue(cells[6], 'class=""'),
            entryPrice: extractCellValue(cells[7], 'class=""'),
            stopLoss: extractCellValue(cells[8], 'class=""'),
            takeProfit: extractCellValue(cells[9], 'class=""'),
            exitDate: convertToISO(extractCellValue(cells[10], 'class=""')),
            exitPrice: extractCellValue(cells[11], 'class=""'),
            commission: extractCellValue(cells[12], 'class=""'),
            swap: extractCellValue(cells[13], 'class=""'),
            profit: extractCellValue(cells[14], 'colspan="2">', 'class="'),
          };
        };

        const extractBalanceCreditTrade = (trade) => {
          const cells = trade.split("<td");

          return {
            entryDate: convertToISO(extractCellValue(cells[1])),
            tradeId: extractCellValue(cells[2]),
            symbol: extractCellValue(cells[15]),
            type: extractCellValue(cells[4]),
            volume: "",
            entryPrice: "",
            stopLoss: "",
            takeProfit: "",
            exitDate: "",
            exitPrice: "",
            commission: extractCellValue(cells[9]),
            swap: extractCellValue(cells[11]),
            profit: extractCellValue(cells[13]),
          };
        };

        const tradeData = allTrades.map((trade) => {
          if (trades.includes(trade)) {
            return extractTrade(trade);
          } else {
            return extractBalanceCreditTrade(trade);
          }
        });

        tradeData.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
        if (tradeData[0].type === "balance") {
          tradeData.shift();
        }
        postMessage({ trades: tradeData });
      } catch (error) {
        postMessage({ error: error.message });
      }
    };

    reader.readAsText(file);
  } catch (error) {
    postMessage({ error: error.message });
  }
};

onmessage = (e) => {
  try {
    const { data } = e;
    parseMt5(data);
  } catch (error) {
    postMessage({ error: error.message });
  }
};
