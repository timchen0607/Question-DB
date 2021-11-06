document.addEventListener("alpine:init", () => {
  Alpine.data("question", () => ({
    init() {
      this.type = null;
      this.result = null;
      this.question = [];
      this.bingo = this.reply = this.percent = 0;
      fetch("https://timchen0607.github.io/Question-DB/db.json")
        .then((res) => res.json())
        .then((json) => {
          this.db = { ...json.question };
          this.main = Object.keys(this.db)[0];
          this.sub = Object.keys(this.db[this.main])[0];
          this.chapter = Object.keys(this.db[this.main][this.sub])[0];
          this.mode = "review";
          this.type = "order";
          this.scoreDB = localStorage.getItem("scoreDB")
            ? JSON.parse(localStorage.getItem("scoreDB"))
            : {};
        });
    },
    preset(tag) {
      if (tag) this.sub = Object.keys(this.db[this.main])[0];
      this.chapter = Object.keys(this.db[this.main][this.sub])[0];
    },
    generate() {
      let qu = [];
      const quDB = this.db[this.main][this.sub][this.chapter];
      Object.keys(quDB).forEach((no) => {
        const target = [this.main, this.sub, this.chapter, no].join();
        quDB[no].no = no;
        quDB[no].score = this.scoreDB[target] ? this.scoreDB[target] : 0;
        if (this.mode === "review" && quDB[no].score >= 3) return;
        if (this.mode === "mistake" && quDB[no].score >= 0) return;
        if (this.mode === "terrible" && quDB[no].score > -3) return;
        qu.push(quDB[no]);
      });
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
      this.quChapter = this.chapter;
      this.bingo = this.reply = this.percent = 0;
    },
    compare(ans) {
      if (this.result !== null) return;
      const qu = this.question[this.quNo];
      const target = [this.main, this.sub, this.chapter, qu.no].join();
      this.result = qu.ans === ans;
      qu.score += this.result ? 1 : -1;
      this.scoreDB[target] = this.question[this.quNo].score = qu.score;
      localStorage.setItem("scoreDB", JSON.stringify(this.scoreDB));
      this.bingo += this.result ? 1 : 0;
      this.reply++;
      this.percent =
        this.reply > 0 ? parseInt((this.bingo / this.reply) * 100) : 0;
      this.timeout = setTimeout(() => this.next(), 5000);
      const btn = document.querySelectorAll(".button-outline")[ans - 1];
      btn.classList.add("active");
      this.$refs.progress.classList.add("show");
    },
    next() {
      clearTimeout(this.timeout);
      document
        .querySelectorAll(".button-outline")
        .forEach((i) => i.classList.remove("active"));
      this.$refs.progress.classList.remove("show");
      this.quNo++;
      this.choose = null;
      this.result = null;
    },
  }));
});
