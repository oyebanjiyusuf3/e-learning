<?php

include('session.php');
//Include database connection details
require("opener_db.php");
/* $errmsg_arr = array();
//Validation error flag
$errflag = false; */

$id_class=$_POST['id_class'];
$name=$_POST['name'];
$filedesc=$_POST['desc'];
$get_id  = $_GET['id'];
$input_name = basename($_FILES['uploaded_file']['name']);
echo $input_name ;
 
//Function to sanitize values received from the form. Prevents SQL injection
/* function clean($str) {
    $str = @trim($str);
    if (get_magic_quotes_gpc()) {
        $str = stripslashes($str);
    }
    return mysql_real_escape_string($str);
}

 */

if ($input_name == ""){

			$name_notification  = 'Add Assignment file name'." ".'<b>'.$name.'</b>';
	   
                mysql_query("INSERT INTO assignment (fdesc,fdatein,teacher_id,class_id,fname) VALUES ('$filedesc',NOW(),'$session_id','$id_class','$name')")or die(mysql_error());
				 mysql_query("insert into notification (teacher_class_id,notification,date_of_notification,link) value('$get_id','$name_notification',NOW(),'assignment_student.php')")or die(mysql_error());               
?>            
			<script>
				window.location = 'assignment.php<?php echo '?id='.$get_id;  ?>';
			</script>
<?php
}else{

//upload random name/number
	$rd2 = mt_rand(1000, 9999) . "_File";
    $filename = basename($_FILES['uploaded_file']['name']);
    $ext = substr($filename, strrpos($filename, '.') + 1);
   
/*  	if ($filename == ""){
	  $newname = "";
	  $rd2 = ""
   } */ 
   $newname = "admin/uploads/" . $rd2 . "_" . $filename;
   
		$name_notification  = 'Add Assignment file name'." ".'<b>'.$name.'</b>';
        //Check if the file with the same name is already exists on the server

            //Attempt to move the uploaded file to it's new place
            (move_uploaded_file($_FILES['uploaded_file']['tmp_name'], $newname));
                //successful upload
                // echo "It's done! The file has been saved as: ".$newname;		   
                $qry2 = "INSERT INTO assignment (fdesc,floc,fdatein,teacher_id,class_id,fname) VALUES ('$filedesc','$newname',NOW(),'$session_id','$id_class','$name')";
				$query = mysql_query("insert into notification (teacher_class_id,notification,date_of_notification,link) value('$get_id','$name_notification',NOW(),'assignment_student.php')")or die(mysql_error());               
			   //$result = @mysql_query($qry);
                $result2 = $connector->query($qry2);
                if ($result2) {
                    $errmsg_arr[] = 'record was saved in the database and the file was uploaded';
                    $errflag = true;
                    if ($errflag) {
                        $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
                        session_write_close();
                        ?>

                     <script>
window.location = 'assignment.php<?php echo '?id='.$get_id;  ?>';
					</script>
                        <?php

                        exit();
                    }
                }
}
				?>