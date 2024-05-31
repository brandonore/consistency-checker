const parseMt4 = (file) => {
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

        // find the start and end indexes of the trade data
        const rowRe = /<tr([\s\S]*?)<\/tr>/g;
        let startIndex = -1;
        let endIndex = -1;
        let match;
        while ((match = rowRe.exec(data)) !== null) {
          const rowHtml = match[0];
          const tds = rowHtml.match(/<td[\s\S]*?<\/td>/g);
          if (
            tds &&
            tds.length > 0 &&
            tds[0].includes('title="') &&
            !tds[0].includes('title=""')
          ) {
            startIndex = match.index;
            break;
          }
        }
        if (startIndex === -1) {
          postMessage({ trades: [], error: "Start index not found" });
          return;
        }

        const endStr = "<td colspan=10>&nbsp;</td>";
        endIndex = data.indexOf(endStr, startIndex);
        if (endIndex === -1) {
          endIndex = data.length;
        }

        // extract the trade data from the HTML string
        const tableHtml = data.substring(startIndex, endIndex);
        const rowsHtml = tableHtml.match(rowRe);

        if (!rowsHtml) {
          postMessage({ trades: [], error: "No rows found in the HTML data" });
          return;
        }

        // loop through the rows and extract the trade info
        let trades = [];
        for (let i = 0; i < rowsHtml.length; i++) {
          const rowHtml = rowsHtml[i];
          const tds = rowHtml.match(/<td[\s\S]*?<\/td>/g);
          if (tds && tds.length > 0) {
            let ignoreRow = false;
            for (let td of tds) {
              if (/<td\s*colspan\s*=\s*["']?9["']?\s*>&nbsp;<\/td>/.test(td)) {
                ignoreRow = true;
                break;
              }
            }
            if (!ignoreRow) {
              let trade = {};
              if (
                (tds.length === 5 && tds[2].includes("balance")) ||
                (tds.length === 5 && tds[2].includes("credit"))
              ) {
                // handle case where row has 5 cells and type is 'balance'
                trade = {
                  tradeId: tds[0] ? tds[0].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  entryDate: tds[1]
                    ? convertToISO(tds[1].replace(/<\/?[^>]+(>|$)/g, ""))
                    : "",
                  type: tds[2].replace(/<\/?[^>]+(>|$)/g, ""),
                  volume: "",
                  symbol: tds[3].replace(/<\/?[^>]+(>|$)/g, ""),
                  entryPrice: "",
                  stopLoss: "",
                  takeProfit: "",
                  exitDate: "",
                  exitPrice: "",
                  commission: "0.00",
                  taxes: "0.00",
                  swap: "0.00",
                  profit: tds[4].replace(/<\/?[^>]+(>|$)/g, ""),
                  fees: "0.00",
                };
              } else {
                // handle regular trades
                trade = {
                  tradeId: tds[0] ? tds[0].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  entryDate: tds[1]
                    ? convertToISO(tds[1].replace(/<\/?[^>]+(>|$)/g, ""))
                    : "",
                  type: tds[2] ? tds[2].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  volume: tds[3] ? tds[3].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  symbol: tds[4] ? tds[4].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  entryPrice: tds[5]
                    ? tds[5].replace(/<\/?[^>]+(>|$)/g, "")
                    : "",
                  stopLoss: tds[6] ? tds[6].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  takeProfit: tds[7]
                    ? tds[7].replace(/<\/?[^>]+(>|$)/g, "")
                    : "",
                  exitDate: tds[8]
                    ? convertToISO(tds[8].replace(/<\/?[^>]+(>|$)/g, ""))
                    : "",
                  exitPrice: tds[9]
                    ? tds[9].replace(/<\/?[^>]+(>|$)/g, "")
                    : "",
                  commission: tds[10]
                    ? tds[10].replace(/<\/?[^>]+(>|$)/g, "")
                    : "",
                  taxes: tds[11] ? tds[11].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  swap: tds[12] ? tds[12].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  profit: tds[13] ? tds[13].replace(/<\/?[^>]+(>|$)/g, "") : "",
                  fees: 0,
                };
              }
              if (trade.commission !== "cancelled") {
                trades.push(trade);
              }
            }
          }
        }
        trades.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
        if (trades.length > 0 && trades[0]?.type === "balance") {
          trades.shift();
        }
        postMessage({ trades });
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
    parseMt4(data);
  } catch (error) {
    postMessage({ error: error.message });
  }
};
