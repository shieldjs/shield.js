describe('shield.js', function() {
  describe('shield#normalize', function() {
    it('should return normalized error synchronously', function() {
      var obj = shield.normalize();
      expect(obj.stack).toEqual([]);
      expect(obj.stack.length).toBe(0);
    });
    it('should call given callback with error info', function() {
      var cb = function(obj) {
        expect(obj.stack).toEqual([]);
        expect(obj.stack.length).toBe(0);
      };
      shield.normalize(cb);
    })
  });

  describe('shield#report', function() {

  });
});
