const AVALON = require('../src/Avalon');


describe('testcase_1',()=>{
    var Avalon = new AVALON(5, {id: 0, name: 'test0'});
    it('addUser',()=>{
        Avalon.addUser({id: 1, name: 'test1'});
        Avalon.addUser({id: 2, name: 'test2'});
        Avalon.addUser({id: 3, name: 'test3'});
        Avalon.addUser({id: 4, name: 'test4'});
        expect(Avalon.getUserList.length).toBe(5);
    })
    it('vote fails',()=>{
        Avalon.assign([0,1]);
        Avalon.vote(0, 'yes');
        Avalon.vote(1, 'no');
        Avalon.vote(2, 'no');
        Avalon.vote(3, 'no');
        expect(Avalon.vote(4, 'yes')).toBe(2);     
    })
    it('vote pass',()=>{
        Avalon.assign([3,4]);
        Avalon.vote(0, 'yes');
        Avalon.vote(1, 'no');
        Avalon.vote(2, 'yes');
        Avalon.vote(3, 'no');
        expect(Avalon.vote(4, 'yes')).toBe(4);     
    })
    it('exec',()=>{
        Avalon.exec(3,'sus');
        expect(Avalon.exec(4,'fail')).toEqual([2,0]);
    })

    // expect(Avalon.vote(4, 'yes')).toBe(4);
    // Avalon.vote(0, 'sus');
    // Avalon.vote(1, 'fail');
    // Avalon.getArthorInfo;
})
