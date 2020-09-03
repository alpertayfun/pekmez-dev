/* 
***
    Pekmez Simple Web Server Model File
***
*/

module.exports = {

	attributes: {

		userId:{
			type:'string',
			required:true,
			unique:true
		},
		user:{
			type:'string',
			required:true
		},
		date:{
			type:'date',
			required:true
		},
  		
	}
};