describe('shield.js', function() {
  describe('Shield#normalize', function() {
    it('should return normalized error synchronously', function() {
      var obj = Shield.normalize();
      expect(obj.stack).toEqual([]);
      expect(obj.stack.length).toBe(0);
    });
    it('should call given callback with error info', function() {
      var cb = function(obj) {
        expect(obj.stack).toEqual([]);
        expect(obj.stack.length).toBe(0);
      };
      Shield.normalize(cb);
    })
  });

  describe('Shield#report', function() {

  });
});
