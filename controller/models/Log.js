/* 
***
    Pekmez Simple Web Server Model File
***
*/

module.exports = {

	attributes: {

		logId:{
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
		createdAt:{
			type:'date',
			required:true
		},
		updatedAt:{
			type:'date',
			required:true
		}
  		
	}
};