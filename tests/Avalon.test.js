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
        let select = ['yes','no','no','no','yes'];
        select.forEach((u,i)=>{
            if(i === 4){
                expect(Avalon.vote(i, select[i])).toBe(2); 
            }
            else
                Avalon.vote(i,select[i]);
        })    
    })
    it('vote pass',()=>{
        Avalon.assign([3,4]);
        let select = ['yes','no','yes','no','yes'];
        select.forEach((u,i)=>{
            if(i === 4){
                expect(Avalon.vote(i, select[i])).toBe(4); 
            }
            else
                Avalon.vote(i,select[i]);
        }) 
    })
    it('exec',()=>{
        Avalon.exec(3,'sus');
        expect(Avalon.exec(4,'fail')).toEqual([2,0]);
    })
    it('end up with good team winning', ()=>{
        let select = ['yes','no','yes','no','yes'];
        Avalon.assign([1,2,3]);
        select.forEach((u,i)=>{
            Avalon.vote(i,select[i]);
        });
        Avalon.exec(1,'sus');
        Avalon.exec(2,'sus');
        Avalon.exec(3,'sus');
        expect(Avalon.getResultCount).toBe(1);

        Avalon.assign([3,4]);
        select.forEach((u,i)=>{
            Avalon.vote(i,select[i]);
        });
        Avalon.exec(3,'sus');
        Avalon.exec(4,'sus');
        expect(Avalon.getResultCount).toBe(2);

        Avalon.assign([2,3,4]);
        select.forEach((u,i)=>{
            Avalon.vote(i,select[i]);
        });
        Avalon.exec(2,'sus');
        Avalon.exec(3,'sus');
        Avalon.exec(4,'sus');
        expect(Avalon.getResultCount).toBe(3);

        // expect(Avalon.state).toBe(5);
    })
})
