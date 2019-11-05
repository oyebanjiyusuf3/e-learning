<?php
include('session.php');
require("opener_db.php");
$name=$_POST['name'];
$filedesc=$_POST['desc'];

$input_name = basename($_FILES['uploaded_file']['name']);
echo $input_name ;
if ($input_name == ""){
				$id=$_POST['selector'];
				$N = count($id);
				for($i=0; $i < $N; $i++)
				{		
						mysql_query("INSERT INTO assignment (fdesc,fdatein,teacher_id,class_id) VALUES ('$filedesc',NOW(),'$session_id','$id[$i]')")or die(mysql_error());
						mysql_query("insert into notification (teacher_class_id,date_of_notification,link) value('$id[$i]',NOW(),'assignment_student.php')")or die(mysql_error());               
				 }
}else{
			$rd2 = mt_rand(1000, 9999) . "_File";
			$filename = basename($_FILES['uploaded_file']['name']);
			$ext = substr($filename, strrpos($filename, '.') + 1);/ 
		$newname = "admin/uploads/" . $rd2 . "_" . $filename;
		$name_notification  = 'Add Assignment file name'." ".'<b>'.$name.'</b>';
            (move_uploaded_file($_FILES['uploaded_file']['tmp_name'], $newname));
				$id=$_POST['selector'];
				$N = count($id);
				for($i=0; $i < $N; $i++)
				{				
                mysql_query("INSERT INTO assignment (fdesc,floc,fdatein,teacher_id,fname,class_id) VALUES ('$filedesc','$newname',NOW(),'$session_id','$name','$id[$i]')")or die(mysql_error());
				mysql_query("insert into notification (teacher_class_id,notification,date_of_notification,link) value('$id[$i]','$name_notification',NOW(),'assignment_student.php')")or die(mysql_error()); 
				}				
}
				?>