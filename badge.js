class Badge {
    constructor(badgeString) {
        this.badgeString = badgeString;

        try {
            const arr1 = badgeString.split('-');
            this.name = arr1[0].trim();
            const arr2 = arr1[1].split('/');
            this.progress = arr2[0].trim();
            this.max = arr2[1].trim();
        } catch (err) {
            console.error(err);
        }
    }

    toString() {
        return this.badgeString;
    }
}

module.exports = Badge;
