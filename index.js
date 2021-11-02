document.addEventListener("alpine:init", () => {
  Alpine.data("question", () => ({
    init() {
      this.type = null;
      this.result = null;
      this.question = [];
      fetch("https://timchen0607.github.io/Question-DB/db.json")
        .then((res) => res.json())
        .then((json) => {
          this.db = { ...json.question };
          this.main = Object.keys(this.db)[0];
          this.sub = Object.keys(this.db[this.main])[0];
          this.chapter = "all";
          this.type = "order";
          this.scoreDB = localStorage.getItem("scoreDB")
            ? JSON.parse(localStorage.getItem("scoreDB"))
            : {};
        });
    },
    generate() {
      let qu = [];
      const quDB = this.db[this.main][this.sub];
      Object.keys(quDB).forEach((chapter) =>
        Object.keys(quDB[chapter]).forEach((no) => {
          const target = [this.main, this.sub, chapter, no].join();
          quDB[chapter][no].no = no;
          quDB[chapter][no].chapter = chapter;
          quDB[chapter][no].score = this.scoreDB[target]
            ? this.scoreDB[target]
            : 0;
          if (
            (this.chapter === "mistake" && quDB[chapter][no].score >= 0) ||
            (this.chapter === "mistake2" && quDB[chapter][no].score > -3) ||
            (this.chapter !== "all" &&
              this.chapter !== "mistake" &&
              this.chapter !== "mistake2" &&
              this.chapter !== chapter)
          )
            return;
          qu.push(quDB[chapter][no]);
        })
      );
      if (this.type === "random")
        for (let i = qu.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [qu[i], qu[j]] = [qu[j], qu[i]];
        }
      qu.push({ no: 0, page: 0, score: 0 });
      this.question = [...qu];
      this.quNo = 0;
      this.choose = null;
      this.result = null;
    },
    compare(ans) {
      if (this.result !== null) return;
      const qu = this.question[this.quNo];
      const target = [this.main, this.sub, qu.chapter, qu.no].join();
      this.result = qu.ans === ans;
      qu.score += this.result ? 1 : -1;
      this.scoreDB[target] = this.question[this.quNo].score = qu.score;
      localStorage.setItem("scoreDB", JSON.stringify(this.scoreDB));
    },
    next() {
      this.quNo++;
      this.choose = null;
      this.result = null;
    },
  }));
});
